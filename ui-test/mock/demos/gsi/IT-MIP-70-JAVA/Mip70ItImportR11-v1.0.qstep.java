package com.hutchison.gsi.it.mip70;

import java.util.HashMap;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

import org.qore.jni.*;

import org.qore.lang.*;
import org.qore.lang.sqlutil.*;
import org.qore.lang.tablemapper.*;
import org.qore.lang.bulksqlutil.*;

import com.qoretechnologies.qorus.*;
import com.qoretechnologies.qorus.ConfigItem;
import com.qoretechnologies.qorus.workflow.*;

public class Mip70ItImportR11 extends QorusNormalArrayStep {
    // "x" is my personal temporary status to lock lines only for this WFIID
    static final String PERSONAL_LOCK = "x";

    @SuppressWarnings("unchecked")
    public void primary(Object smi) throws Throwable {
        String src_message_id = smi.toString();
        logInfo("processing message_id %y", src_message_id);

        String mseplit = (String)getConfigItemValue("msepl-it");
        String ebs11i = (String)getConfigItemValue("ebs11i");
        // get select and insert block size
        int block_size = (int)getConfigItemValue("block_size");
        // get remote timeout
        int remote_timeout = (int)getConfigItemValue("remote_timeout");
        logInfo("mseplit: %y ebs11i: %y block size: %d rows remote timeout: %d ms", mseplit, ebs11i, block_size, remote_timeout);

        DbRemote db = new DbRemote(mseplit, ebs11i);
        try {
            InboundTableMapper mapperLog = (InboundTableMapper)getMapper("it-70b-gl_journal-r11-log-java-in");
            DatasourcePool dsstage = UserApi.getDatasourcePool((String)getConfigItemValue("gsi_staging"));

            // create insert option hash
            HashMap<String, Object> insert_opts = new HashMap<String, Object>() {
                {
                    put("block_size", block_size);
                }
            };

            BulkInsertOperation iface = new BulkInsertOperation(getSqlTable(dsstage, "h3g_it_gl_import_all"), insert_opts);

            // get the current workflow_instanceid
            int wfiid = getWfiid();

            // constant values for the GL detail table lines
            HashMap<String, Object> row_const = new HashMap<String, Object>() {
                {
                    put("message_id", src_message_id);
                    put("source_system", "R11");
                    put("target_system", "H3G");
                    put("message_type", "R11_JOURNALS");
                    put("qorus_wfiid", wfiid);
                    put("int_status", "N");
                    put("status", "NEW");
                    put("date_created", ZonedDateTime.now());
                    put("created_by", wfiid);
                    put("actual_flag", "A");
                }
            };

            try {
                HashMap<String, Object> wh = new HashMap<String, Object>() {
                    {
                        put("message_id", src_message_id);
                    }
                };

                HashMap<String, Object> sh = new HashMap<String, Object>() {
                    {
                        put("columns", "record_count");
                        put("where", wh);
                    }
                };

                // get the header table name
                String header_table_name = (String)getConfigItemValue("header-table-name");
                int headerCount = (int)((HashMap<String, Object>)db.callRemoteMethod("select_row", header_table_name, sh)).get("record_count");

                sh = new HashMap<String, Object>() {
                    {
                        put("columns", AbstractTable.cop_as(AbstractTable.cop_count(), "lines_count"));
                        put("where", wh);
                    }
                };

                // get the detail table name
                String detail_table_name = (String)getConfigItemValue("detail-table-name");
                int linesCount = (int)((HashMap<String, Object>)db.callRemoteMethod("select_row", detail_table_name, sh)).get("lines_count");

                if (headerCount != linesCount) {
                    logInfo("BUSINESS-ERROR on EBS R11: Header count: %d, different from lines count: %d for message_id: %d was marked with int_status E", headerCount, linesCount, src_message_id);
                    throw new QoreException("BUSINESS_ERROR", String.format("BUSINESS-ERROR on EBS R11: Header count: %d, different from lines count: %d for message_id: %d was marked with int_status E", headerCount, linesCount, src_message_id));
                }

                // get the log table name
                String log_table_name = mapperLog.getTableName();
                AbstractTable t_h = getSqlTable(dsstage, log_table_name);
                int message_id_count = (int)(((HashMap<String, Object>)t_h.selectRow(sh)).get("lines_count"));

                if (message_id_count > 0) {
                    logInfo("BUSINESS-ERROR on EBS R11: message_id: %d already exists in R12", src_message_id);
                    throw new QoreException("BUSINESS-ERROR", String.format("BUSINESS-ERROR on EBS R11: message_id: %d already exists in R12", src_message_id));
                }

                {
                    HashMap<String, Object> log_row = new HashMap<String, Object>() {
                        {
                            put("ref_transfer", src_message_id);
                            put("message_id", src_message_id);
                            put("record_count", headerCount);
                        }
                    };

                    mapperLog.insertRow(log_row);
                }

                HashMap<String, Object> new_sh = new HashMap<String, Object>() {
                    {
                        put("where", wh);
                    }
                };

                HashMap<String, Object> recv_opts = new HashMap<String, Object>() {
                    {
                        put("select", new_sh);
                        put("timeout", remote_timeout);
                        put("block", block_size);
                    }
                };

                DbRemoteReceive recv = new DbRemoteReceive(db, "select", detail_table_name, recv_opts);
                try {
                    while (true) {
                        HashMap<String, Object> data = recv.getData();
                        if (data == null) {
                            break;
                        }

                        //logInfo("received block: %d rows", data.firstValue().lsize());
                        HashMap<String, Object> row_data = new HashMap<String, Object>(data);
                        row_data.putAll(row_const);
                        iface.queueData(row_data);
                    }

                    HashMap<String, Object> update_hash = new HashMap<String, Object>() {
                        {
                            put("int_status", "I");
                            put("status_end", ZonedDateTime.now());
                        }
                    };

                    HashMap<String, Object> cond_hash = new HashMap<String, Object>() {
                        {
                            put("int_status", "W");
                            put("message_id", src_message_id);
                        }
                    };

                    int ret = (int)db.callRemoteMethod("update", header_table_name, update_hash, cond_hash);
                    logInfo("Updated %s.int_status = %s; where int_status = %s; count: %d", header_table_name, "I", "W", ret);
                } catch (Throwable e) {
                    recv.disconnect();
                    throw e;
                }

                iface.flush();
                dsstage.commit();
                db.commit();
            } catch (Throwable e) {
                iface.discard();
                dsstage.rollback();
                db.rollback();
            }
        } catch (Throwable e) {
            throw e;
        }
    }

    public Object[] array() throws Throwable {
        return (Object[])getDynamicData().get("src_message_ids");
    }

    protected HashMap<String, ConfigItem> getConfigItemsImpl() {
        return new HashMap<String, ConfigItem>() {
            {
                put("block_size", new ConfigItem("The row block size for datastream transfers")
                    .withType("int")
                    .withDefaultValue(60000)
                    .withStrictlyLocal(true)
                );
                put("remote_timeout", new ConfigItem("The network I/O timeout in milliseconds")
                    .withType("int")
                    .withDefaultValue(600000)
                    .withStrictlyLocal(true)
                );
                put("gsi_staging", new ConfigItem("The staging database connection name")
                    .withDefaultValue("gsi_staging")
                );
                put("header-table-name", new ConfigItem("The R11 header table name")
                    .withDefaultValue("h3g_it_gl_int_header")
                );
                put("detail-table-name", new ConfigItem("The R11 detail table name")
                    .withDefaultValue("h3g_it_gl_int_detail")
                );
                put("msepl-it", new ConfigItem("the mSEPL IT remote connection name")
                    .withDefaultValue("msepl-it")
                );
                put("ebs11i", new ConfigItem("the EBS 11i connection name")
                    .withDefaultValue("ebs11i")
                );
            }
        };
    }
}
// END