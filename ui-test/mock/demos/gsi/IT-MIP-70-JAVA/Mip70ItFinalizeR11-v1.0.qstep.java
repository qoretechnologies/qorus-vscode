package com.hutchison.gsi.it.mip70;

import com.qoretechnologies.qorus.*;
import com.qoretechnologies.qorus.ConfigItem;
import com.qoretechnologies.qorus.workflow.*;

import java.util.HashMap;

import org.qore.lang.*;
import org.qore.lang.sqlutil.*;
import org.qore.lang.tablemapper.*;

public class Mip70ItFinalizeR11 extends QorusNormalStep {
    public void primary() throws Throwable {
        int wfiid = getWfiid();
        DatasourcePool dsstage = UserApi.getDatasourcePool((String)getConfigItemValue("gsi_staging"));

        try {
            AbstractTable t_h = getSqlTable(dsstage, ((InboundTableMapper)getMapper("it-70b-gl_journal-r11-log-java-in"))
                .getTableName());

            HashMap<String, Object> update_hash = new HashMap<String, Object>() {
                {
                    put("int_status", "N");
                    put("qorus_wfiid", wfiid);
                }
            };

            t_h.update(update_hash);

            dsstage.commit();
        } catch (Throwable e) {
            dsstage.rollback();
            throw e;
        }
    }

    protected HashMap<String, ConfigItem> getConfigItemsImpl() {
        return new HashMap<String, ConfigItem>() {
            {
                put("gsi_staging", new ConfigItem("The staging database connection name")
                    .withDefaultValue("gsi_staging"));
            }
        };
    }
}
// END
