package cugb.labsafety.doorplate;

import android.app.Activity;
import android.content.Intent;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.hik.vis.module_base.IHikCallback;
import com.hik.vis.module_base.beans.ResponseStatus;
import com.hik.vis.module_sdk.IHikManager;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Pattern;

@CapacitorPlugin(name = "HikFace")
public class HikFacePlugin extends Plugin {
    private static final Pattern EMPLOYEE_NO = Pattern.compile("^[A-Za-z0-9]{1,32}$");
    private final AtomicBoolean inFlight = new AtomicBoolean(false);

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", HikDoorplateApplication.isSdkAvailable());
        if (!HikDoorplateApplication.isSdkAvailable()) {
            result.put("reason", HikDoorplateApplication.getSdkUnavailableReason());
        }
        call.resolve(result);
    }

    @PluginMethod
    public void verify(PluginCall call) {
        if (!requireSdk(call) || !beginOperation(call)) return;
        Intent intent = new Intent(getContext(), HikFaceActivity.class);
        intent.putExtra(HikFaceActivity.EXTRA_MODE, HikFaceActivity.MODE_VERIFY);
        startActivityForResult(call, intent, "handleFaceResult");
    }

    @PluginMethod
    public void enroll(PluginCall call) {
        if (!requireSdk(call)) return;
        String employeeNo = trimmed(call.getString("employeeNo"));
        String name = trimmed(call.getString("name"));
        if (!EMPLOYEE_NO.matcher(employeeNo).matches()) {
            call.reject("工号必须为 1–32 位字母或数字", "INVALID_EMPLOYEE_NO");
            return;
        }
        if (name.isEmpty() || name.length() > 64) {
            call.reject("姓名必须为 1–64 个字符", "INVALID_NAME");
            return;
        }
        if (!beginOperation(call)) return;

        Intent intent = new Intent(getContext(), HikFaceActivity.class);
        intent.putExtra(HikFaceActivity.EXTRA_MODE, HikFaceActivity.MODE_ENROLL);
        intent.putExtra(HikFaceActivity.EXTRA_EMPLOYEE_NO, employeeNo);
        intent.putExtra(HikFaceActivity.EXTRA_NAME, name);
        startActivityForResult(call, intent, "handleFaceResult");
    }

    @PluginMethod
    public void openDoor(PluginCall call) {
        if (!requireSdk(call) || !beginOperation(call)) return;
        try {
            IHikManager.getAccessManager().openDoor(new IHikCallback<ResponseStatus>() {
                @Override
                public void onSuccess(ResponseStatus responseStatus) {
                    inFlight.set(false);
                    JSObject result = new JSObject();
                    result.put("status", "opened");
                    result.put("doorNo", 1);
                    result.put("eventTime", now());
                    result.put("message", "门禁已打开");
                    call.resolve(result);
                }

                @Override
                public void onFailure(ResponseStatus responseStatus) {
                    inFlight.set(false);
                    call.reject(sdkFailure("门禁打开失败", responseStatus), "HIK_DOOR_OPEN_FAILED");
                }
            });
        } catch (Throwable error) {
            inFlight.set(false);
            call.reject("门禁打开失败：" + error.getClass().getSimpleName(), "HIK_DOOR_OPEN_FAILED");
        }
    }

    private boolean requireSdk(PluginCall call) {
        if (HikDoorplateApplication.isSdkAvailable()) return true;
        call.reject(HikDoorplateApplication.getSdkUnavailableReason(), "HIK_SDK_UNAVAILABLE");
        return false;
    }

    private boolean beginOperation(PluginCall call) {
        if (inFlight.compareAndSet(false, true)) return true;
        call.reject("已有一项设备操作正在进行", "HIK_DEVICE_BUSY");
        return false;
    }

    @ActivityCallback
    private void handleFaceResult(PluginCall call, ActivityResult activityResult) {
        inFlight.set(false);
        if (call == null) return;

        Intent data = activityResult.getData();
        JSObject result = new JSObject();
        if (data == null) {
            result.put("status", "cancelled");
            call.resolve(result);
            return;
        }

        result.put("status", data.getStringExtra(HikFaceActivity.RESULT_STATUS));
        putIfPresent(result, "employeeNo", data.getStringExtra(HikFaceActivity.RESULT_EMPLOYEE_NO));
        putIfPresent(result, "name", data.getStringExtra(HikFaceActivity.RESULT_NAME));
        putIfPresent(result, "eventTime", data.getStringExtra(HikFaceActivity.RESULT_EVENT_TIME));
        putIfPresent(result, "message", data.getStringExtra(HikFaceActivity.RESULT_MESSAGE));
        call.resolve(result);
    }

    private static void putIfPresent(JSObject target, String key, String value) {
        if (value != null && !value.isEmpty()) target.put(key, value);
    }

    private static String trimmed(String value) {
        return value == null ? "" : value.trim();
    }

    private static String now() {
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.CHINA).format(new Date());
    }

    private static String sdkFailure(String prefix, ResponseStatus error) {
        if (error == null) return prefix;
        int code = error.getErrorCode();
        if (code == -1) code = error.getStatusCode();
        return code == -1 ? prefix : prefix + "（错误码 " + code + "）";
    }
}
