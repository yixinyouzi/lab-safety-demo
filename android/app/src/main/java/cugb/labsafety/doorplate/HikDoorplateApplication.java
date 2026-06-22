package cugb.labsafety.doorplate;

import android.app.Application;

import com.hik.vis.module_sdk.IHikManager;
import com.hik.vis.module_sdk.constant.DeviceType;
import com.hik.vis.module_sdk.constant.IHikConfig;

public class HikDoorplateApplication extends Application {
    private static volatile boolean sdkAvailable;
    private static volatile String sdkUnavailableReason;

    @Override
    public void onCreate() {
        super.onCreate();
        try {
            IHikManager.init(IHikConfig.createConfig(this).setDeviceType(DeviceType.ACCESS));
            sdkAvailable = IHikManager.isInit
                    && IHikManager.getAccessManager() != null
                    && IHikManager.getPersonalManager() != null;
            if (!sdkAvailable) {
                sdkUnavailableReason = "海康 SDK 管理器未就绪";
            }
        } catch (Throwable error) {
            sdkAvailable = false;
            sdkUnavailableReason = error.getClass().getSimpleName();
        }
    }

    public static boolean isSdkAvailable() {
        return sdkAvailable;
    }

    public static String getSdkUnavailableReason() {
        return sdkUnavailableReason == null ? "海康 SDK 不可用" : sdkUnavailableReason;
    }
}
