package cugb.labsafety.doorplate;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.hik.vis.module_access.beans.response.AccessControllerEventBean;
import com.hik.vis.module_access.constant.VerifyMethod;
import com.hik.vis.module_access.constant.VerifyType;
import com.hik.vis.module_access.interfaces.IAccessEventListener;
import com.hik.vis.module_base.IHikCallback;
import com.hik.vis.module_base.beans.ResponseStatus;
import com.hik.vis.module_base.constant.AcsEventMinor;
import com.hik.vis.module_personal.beans.response.CaptureResponseFaceBean;
import com.hik.vis.module_sdk.IHikManager;

import java.util.concurrent.atomic.AtomicBoolean;

public class HikFaceActivity extends AppCompatActivity {
    public static final String EXTRA_MODE = "mode";
    public static final String EXTRA_EMPLOYEE_NO = "employeeNo";
    public static final String EXTRA_NAME = "name";
    public static final String MODE_VERIFY = "verify";
    public static final String MODE_ENROLL = "enroll";

    public static final String RESULT_STATUS = "status";
    public static final String RESULT_EMPLOYEE_NO = "employeeNo";
    public static final String RESULT_NAME = "name";
    public static final String RESULT_EVENT_TIME = "eventTime";
    public static final String RESULT_MESSAGE = "message";

    private static final long OPERATION_TIMEOUT_MS = 20_000L;
    private static final long RESULT_DISPLAY_MS = 900L;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final AtomicBoolean completed = new AtomicBoolean(false);
    private String mode;
    private String employeeNo;
    private String personName;
    private boolean eventRegistered;
    private boolean verifyRequested;
    private boolean enrollmentStarted;
    private TextView titleView;
    private TextView statusView;
    private Button actionButton;

    private final Runnable timeout = () -> complete("timeout", null, null, null,
            "操作超时，请重新正对摄像头", 0L);

    private final IAccessEventListener accessEventListener = new IAccessEventListener() {
        @Override
        public void onAccessControllerEvent(AccessControllerEventBean event) {
            if (event == null || event.getAccessControllerEvent() == null
                    || event.getAccessControllerEvent().getSubEventType() == null) return;

            AccessControllerEventBean.AccessControllerEvent detail = event.getAccessControllerEvent();
            int subEventType = detail.getSubEventType();
            if (subEventType == AcsEventMinor.MINOR_FACE_VERIFY_PASS) {
                complete("passed", detail.getEmployeeNoString(), detail.getName(),
                        event.getDateTime(), "身份核验通过（未执行开门）", RESULT_DISPLAY_MS);
            } else if (subEventType == AcsEventMinor.MINOR_FACE_VERIFY_FAIL) {
                complete("failed", null, null, event.getDateTime(),
                        "身份核验未通过", RESULT_DISPLAY_MS);
            }
        }
    };

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        setContentView(R.layout.activity_hik_face);

        mode = getIntent().getStringExtra(EXTRA_MODE);
        employeeNo = getIntent().getStringExtra(EXTRA_EMPLOYEE_NO);
        personName = getIntent().getStringExtra(EXTRA_NAME);
        titleView = findViewById(R.id.hik_face_title);
        statusView = findViewById(R.id.hik_face_status);
        actionButton = findViewById(R.id.hik_face_action);
        findViewById(R.id.hik_face_cancel).setOnClickListener(v -> cancelOperation());

        if (MODE_ENROLL.equals(mode)) {
            titleView.setText("录入设备人脸");
            statusView.setText(personName + " · " + employeeNo + "\n请正对摄像头，确认后开始采集");
            actionButton.setVisibility(View.VISIBLE);
            actionButton.setText("采集并录入");
            actionButton.setOnClickListener(v -> startEnrollment());
        } else {
            mode = MODE_VERIFY;
            titleView.setText("设备人脸核验");
            statusView.setText("请正对摄像头");
            actionButton.setVisibility(View.GONE);
            registerAccessEvents();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (MODE_VERIFY.equals(mode) && !verifyRequested && !completed.get()) {
            openFaceVerify();
        }
    }

    @Override
    protected void onPause() {
        handler.removeCallbacks(timeout);
        if (MODE_VERIFY.equals(mode) && verifyRequested) closeFaceVerify();
        if (MODE_ENROLL.equals(mode) && enrollmentStarted && !completed.get()) {
            complete("cancelled", null, null, null, "录入因页面离开而取消", 0L);
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (eventRegistered) {
            IHikManager.getAccessManager().removeEventListener(accessEventListener);
            eventRegistered = false;
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        cancelOperation();
    }

    private void registerAccessEvents() {
        IHikManager.getAccessManager().addEventListener(accessEventListener);
        eventRegistered = true;
    }

    private void openFaceVerify() {
        verifyRequested = true;
        setBusyStatus("正在启动设备人脸算法…");
        IHikManager.getAccessManager().openAccessVerify(
                VerifyMethod.FLAG_FACE,
                VerifyType.verify,
                false,
                new IHikCallback<ResponseStatus>() {
                    @Override
                    public void onSuccess(ResponseStatus data) {
                        runOnUiThread(() -> {
                            if (completed.get()) return;
                            statusView.setText("识别中 · 请保持正对摄像头");
                            scheduleTimeout();
                        });
                    }

                    @Override
                    public void onFailure(ResponseStatus error) {
                        complete("failed", null, null, null, sdkFailure("启动核验失败", error), 0L);
                    }
                });
    }

    private void closeFaceVerify() {
        verifyRequested = false;
        IHikManager.getAccessManager().closeAccessVerify(new IHikCallback<ResponseStatus>() {
            @Override public void onSuccess(ResponseStatus data) {}
            @Override public void onFailure(ResponseStatus error) {}
        });
    }

    private void startEnrollment() {
        if (completed.get()) return;
        enrollmentStarted = true;
        actionButton.setEnabled(false);
        setBusyStatus("正在采集人脸 · 请保持不动");
        scheduleTimeout();
        IHikManager.getPersonalManager().captureFace(new IHikCallback<CaptureResponseFaceBean>() {
            @Override
            public void onSuccess(CaptureResponseFaceBean capture) {
                if (capture == null || (TextUtils.isEmpty(capture.getFaceDataUrl())
                        && TextUtils.isEmpty(capture.getModelData()))) {
                    complete("failed", employeeNo, personName, null, "设备未返回有效人脸数据", 0L);
                    return;
                }
                createOrUpdatePerson(capture);
            }

            @Override
            public void onFailure(ResponseStatus error) {
                complete("failed", employeeNo, personName, null, sdkFailure("人脸采集失败", error), 0L);
            }
        });
    }

    private void createOrUpdatePerson(CaptureResponseFaceBean capture) {
        runOnUiThread(() -> setBusyStatus("采集完成 · 正在创建人员记录"));
        IHikManager.getPersonalManager().addOrModUser(employeeNo, personName,
                new IHikCallback<ResponseStatus>() {
                    @Override
                    public void onSuccess(ResponseStatus data) {
                        bindFace(capture);
                    }

                    @Override
                    public void onFailure(ResponseStatus error) {
                        complete("failed", employeeNo, personName, null,
                                sdkFailure("人员记录创建失败", error), 0L);
                    }
                });
    }

    private void bindFace(CaptureResponseFaceBean capture) {
        runOnUiThread(() -> setBusyStatus("正在绑定设备人脸"));
        String faceUrl = TextUtils.isEmpty(capture.getFaceDataUrl()) ? null : capture.getFaceDataUrl();
        String modelData = faceUrl == null ? capture.getModelData() : null;
        IHikManager.getPersonalManager().addFace(employeeNo, faceUrl, modelData,
                new IHikCallback<ResponseStatus>() {
                    @Override
                    public void onSuccess(ResponseStatus data) {
                        complete("enrolled", employeeNo, personName, null,
                                "人员与人脸已写入设备", RESULT_DISPLAY_MS);
                    }

                    @Override
                    public void onFailure(ResponseStatus error) {
                        complete("failed", employeeNo, personName, null,
                                sdkFailure("人脸绑定失败，可保留工号后重试", error), 0L);
                    }
                });
    }

    private void scheduleTimeout() {
        handler.removeCallbacks(timeout);
        handler.postDelayed(timeout, OPERATION_TIMEOUT_MS);
    }

    private void setBusyStatus(String text) {
        statusView.setText(text);
    }

    private void cancelOperation() {
        complete("cancelled", null, null, null, "操作已取消", 0L);
    }

    private void complete(String status, String resultEmployeeNo, String resultName,
                          String eventTime, String message, long delayMs) {
        if (!completed.compareAndSet(false, true)) return;
        handler.removeCallbacks(timeout);
        runOnUiThread(() -> {
            statusView.setText(message);
            actionButton.setEnabled(false);
            handler.postDelayed(() -> {
                Intent result = new Intent();
                result.putExtra(RESULT_STATUS, status);
                putExtra(result, RESULT_EMPLOYEE_NO, resultEmployeeNo);
                putExtra(result, RESULT_NAME, resultName);
                putExtra(result, RESULT_EVENT_TIME, eventTime);
                putExtra(result, RESULT_MESSAGE, message);
                setResult(Activity.RESULT_OK, result);
                finish();
            }, delayMs);
        });
    }

    private static void putExtra(Intent target, String key, String value) {
        if (!TextUtils.isEmpty(value)) target.putExtra(key, value);
    }

    private static String sdkFailure(String prefix, ResponseStatus error) {
        if (error == null) return prefix;
        int code = error.getErrorCode();
        if (code == -1) code = error.getStatusCode();
        return code == -1 ? prefix : prefix + "（错误码 " + code + "）";
    }
}
