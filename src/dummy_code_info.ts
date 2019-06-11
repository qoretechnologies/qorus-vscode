export const dummy_data = {
    "class": [
        {
            "name": "CsvFileIteratorWithLineGetter",
            "desc": "CSV file iterator class with extra methods to get the current line"
        },
        {
            "name": "RebusHttpHandler",
            "desc": "Polls SFTP server for files and creates wf orders to process them"
        },
        {
            "name": "RebusSftpPoller",
            "desc": "Polls SFTP server for files and creates wf orders to process them"
        }
    ],
    "function": [
        {
            "name": "uk_003_po_exp_receipt_lib",
            "desc": "common functions for UK-003-PO_EXP_RECEIPT-UTL-OUT"
        },
        {
            "name": "uk-007-011-common",
            "desc": "MIP007 and MIP011 common functions"
        },
        {
            "name": "uk-014-om_ship_req-lib",
            "desc": "MIP014 functions"
        },
        {
            "name": "uk_021_commissioning_data_lib",
            "desc": "common functions for UK-021-COMMISSIONING_DATA-TIBCO-OUT"
        },
        {
            "name": "uk-lib-inbound_tracker",
            "desc": "Common Inbound Tracker library functions"
        },
        {
            "name": "uk-lib-render_iso8601_date",
            "desc": "helper function for transforming 'date' types to its ISO8601 string"
        },
        {
            "name": "uk-lib-sftp",
            "desc": "helper functions for common sftp operations"
        },
        {
            "name": "uk-lib-test-common",
            "desc": "common helper/mock functions for testing UK"
        },
        {
            "name": "uk-lib-unit-test-mock",
            "desc": "Mock functions for testing UK Rebus project."
        },
        {
            "name": "uk-mapper-lib",
            "desc": "UK mapper library"
        },
        {
            "name": "uk-validation-inv-serial_numbers_short",
            "desc": "Inbound Data Validation"
        },
        {
            "name": "uk-validation-inv-stock_in_subinventory",
            "desc": "Inbound Data Validation"
        },
        {
            "name": "uk-validation-inv-subinventory",
            "desc": "Inbound Data Validation"
        },
        {
            "name": "uk-validation-wsh-original_delivery",
            "desc": "Inbound Data Validation"
        },
        {
            "name": "uk_errorfunction_base",
            "desc": "the base errorfunction for all workflows/jobs/services;"
        }
    ],
    "constant": [
        {
            "name": "uk-000-lip-conf",
            "desc": "constants used in 000 LIP"
        },
        {
            "name": "uk-001-master_item-anovo-out",
            "desc": "audit tables with their \"important\" columns"
        },
        {
            "name": "uk-001-master_item-datalake-out",
            "desc": "defines constants for MIP1 Data Lake job and workflow"
        },
        {
            "name": "uk-014-om_ship_req-utl-out",
            "desc": "audit tables with their \"important\" columns"
        },
        {
            "name": "uk-049-po_internal_req-utl",
            "desc": "constants used in MIP 049 UTL"
        },
        {
            "name": "uk-165-employee_hcm_master_worker-callidus-out",
            "desc": "destination directory for sending file"
        },
        {
            "name": "uk-165-employee_hcm_master_work_structure-callidus-out",
            "desc": "destination directory for sending file"
        },
        {
            "name": "uk-179-lip-conf",
            "desc": "constants used in 179 LIP"
        }
    ],
    "mapper": [
        {
            "name": "uk-004-po_receipt-utl-rcv_headers_interface-in",
            "desc": "MIP 004 PO Receipt inbound mapper for UTL"
        },
        {
            "name": "uk-004-po_receipt-utl-rcv_transactions_interface-in",
            "desc": "MIP 004 PO Receipt inbound mapper for UTL"
        },
        {
            "name": "uk-006-po_rtm_send-anovo-mtl_serial_numbers_interface-in",
            "desc": "MIP 006 Po rtm send ANOVO inbound mapper"
        },
        {
            "name": "uk-010-recode_adjustment-anovo-mtl_serial_numbers_interface-in",
            "desc": "MIP 010 Recode Adjustment ANOVO inbound mapper"
        },
        {
            "name": "uk-010-recode_adjustment-anovo-mtl_transactions_interface-in",
            "desc": "MIP 010 Recode Adjustment ANOVO inbound mapper"
        },
        {
            "name": "uk-019-om_ship_confirm-utl-ship_return_details-in",
            "desc": "MIP 019 inbound mapper for UTL"
        },
        {
            "name": "uk-027-rma_request_wom-anovo-oe_actions_iface_all-in",
            "desc": "MIP 027 RMA request inbound mapper for ANOVO"
        },
        {
            "name": "uk-031-rma_receipt-anovo-mtl_serial_numbers_interface-in",
            "desc": "MIP 031 inbound mapper for ANOVO"
        },
        {
            "name": "uk-031-rma_receipt-anovo-rcv_headers_interface-in",
            "desc": "MIP 031 inbound mapper for ANOVO"
        },
        {
            "name": "uk-037-inv_receipt-anovo-mtl_serial_numbers_interface-in",
            "desc": "MIP 037 Serial Numbers Interface ANOVO"
        },
        {
            "name": "uk-037-inv_receipt-anovo-rcv_serials_interface-in",
            "desc": "MIP 037 Serial Numbers Interface ANOVO"
        },
        {
            "name": "uk-164-employee_accruals-callidus-gl_interface-in",
            "desc": "MIP 164 Employee Accruals inbound mapper"
        },
        {
            "name": "uk-164-wholesale_accruals-callidus-gl_interface-in",
            "desc": "MIP 164 Wholesale Accruals inbound mapper"
        },
        {
            "name": "uk-167-employee_commissions-callidus-in",
            "desc": "MIP 167 inbound mapper for export to EBS"
        }
    ],
	"value-map": [
        {
            "name": "it-02-sales_agents-web_type",
            "desc": "MIP02 Sales agents web_type mapping"
        },
        {
            "name": "it-34-inv_direct_transfer-inventory-tat-smart",
            "desc": "MIP 34 SMART TAT inventory lookups"
        },
        {
            "name": "h3g_file_transfer_actions",
            "desc": "map of file actions to workflows names"
        },
        {
            "name": "h3g_file_transfer_sftp",
            "desc": "map of SFTP configurations to proper user connections"
        }
    ],
    "author": [
        {
            "name": "David Nichols (Qore Technologies, sro)"
        },
        {
            "name": "Adrian Lachata (Qore Technologies, sro)"
        },
        {
            "name": "Frantisek Synek (Qoretechnologies)"
        },
        {
            "name": "Frantisek Synek (Qore Technologies)"
        },
        {
            "name": "Qore Technologies, sro"
        },
        {
            "name": "Pavel Kveton (Qore Technologies, sro)"
        },
        {
            "name": "Pavel Kveton (Qore Technologies, s.r.o.)"
        },
        {
            "name": "Enzo Corbo (Accenture Italy)"
        },
        {
            "name": "Claudio Deluca (Accenture)"
        },
        {
            "name": "Claudio Deluca (Accenture ATS)"
        },
    ],
};

export const dummy_base_classes = [
    {
        name: 'QorusService1',
        desc: 'Service class 2',
    },
    {
        name: 'QorusService2',
        desc: 'Service class 2',
    },
];

