package cugb.labsafety.doorplate;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(HikFacePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
