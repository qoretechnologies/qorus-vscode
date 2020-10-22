package com.hutchison.gsi.it.mip70;

import java.util.HashMap;
import java.math.BigDecimal;

import org.qore.jni.QoreJavaApi;

import com.qoretechnologies.qorus.*;
import com.qoretechnologies.qorus.ConfigItem;
import com.qoretechnologies.qorus.workflow.*;

public class Mip70ItLockR11 extends QorusNormalStep {
    // "x" is my personal temporary status to lock lines only for this WFIID
    static final String PERSONAL_LOCK = "x";

    @SuppressWarnings("unchecked")
    public void primary() throws Throwable {
        String mseplit = (String)getConfigItemValue("msepl-it");
        String ebs11i = (String)getConfigItemValue("ebs11i");
        logInfo("mseplit: %y ebs11i: %y", mseplit, ebs11i);

        DbRemote db = new DbRemote(mseplit, ebs11i);
        try {
            // get the current workflow instanceid
            int wfiid = getWfiid();

            // get the header table name
            String header_table_name = (String)getConfigItemValue("header-table-name");

            // setup the update hash condition
            HashMap<String, Object> update_cond = new HashMap<String, Object>() {
                {
                    put("int_status", PERSONAL_LOCK);
                    put("qorus_wfiid", wfiid);
                }
            };

            {
                // setup the where hash condition
                HashMap<String, Object> where_cond = new HashMap<String, Object>() {
                    {
                        put("int_status", "N");
                        put("source_system", "R11");
                        put("message_type", "R11_JOURNALS");
                        put("record_count", QoreJavaApi.callFunction("op_ne"));
                    }
                };

                int ret = (int)db.callRemoteMethod("update", header_table_name, update_cond, where_cond);
                logInfo("Updated %s.status = %s; where status = %s; count: %d",
                    header_table_name, PERSONAL_LOCK, "N", ret);
            }

            // create new where hash
            final HashMap<String, Object> where_cond = new HashMap<String, Object>() {
                {
                    put("int_status", PERSONAL_LOCK);
                    put("source_system", "R11");
                    put("message_type", "R11_JOURNALS");
                }
            };

            // create select hash
            HashMap<String, Object> sh = new HashMap<String, Object>() {
                {
                    put("columns", "message_id");
                    put("where", where_cond);
                }
            };

            // get source message IDs for dynamic data
            BigDecimal[] src_message_ids;
            {
                logInfo("about to call remote select");
                HashMap<String, Object> result = (HashMap<String, Object>)db.callRemoteMethod("select",
                    header_table_name, sh);
                src_message_ids = (BigDecimal[])result.get("message_id");
                logInfo("got message_ids: %y", (Object)src_message_ids);
            }

            // create dynamic data hash
            HashMap<String, Object> dd = new HashMap<String, Object>() {
                {
                    put("src_message_ids", src_message_ids);
                }
            };
            // update dynamic data for the order
            updateDynamicData(dd);
            // set order keys
            setOrderKey("message_id", (Object[])src_message_ids);

            // update the remote database
            update_cond = new HashMap<String, Object>() {
                {
                    put("int_status", "W");
                }
            };
            // reuse where cond
            int ret = (int)db.callRemoteMethod("update", header_table_name, update_cond, where_cond);
            logInfo("Updated %s.status = %s; where status = %s; count: %d", "W", header_table_name,
                PERSONAL_LOCK, ret);

            // commit the remote transaction
            db.commit();
        } catch (Throwable e) {
            db.rollback();
            throw e;
        }
    }
}
// END