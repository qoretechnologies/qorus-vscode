import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { QorusProject } from './QorusProject';
import { filesInDir, canBeParsed } from './qorus_utils';
import { t } from 'ttag';
import * as msg from './qorus_message';


const object_parser_command = 'qop.q';
const object_chunk_length = 30;

export class QorusProjectCodeInfo {
    private project: QorusProject;
    private pending: boolean = false;
    private code_info: any = {};

    constructor(project: QorusProject) {
        this.project = project;
    }

    getObjects(object_type: string, webview: vscode.Webview) {
        let objects: any[] = [];
        switch (object_type) {
            case 'base-class':
                objects = dummy_base_classes;
                break;
            case 'author':
            case 'function':
            case 'class':
            case 'constant':
            case 'mapper':
            case 'value-map':
//                objects = this.code_info[object_type];
                objects = dummy_data[object_type];
            default:
                objects = [];
        }

        webview.postMessage({
            action: 'creator-return-objects',
            object_type,
            objects,
        });
    }

    update() {
        setTimeout(() => {
            this.project.validateConfigFileAndDo(file_data => {
                this.doUpdate(file_data.source_directories);
            });
        }, 500);

        msg.log(t`CodeInfoUpdateStarted ${this.project.folder}` + ' ' + new Date().toString());
        this.pending = true;
    }

    private doUpdate(source_directories: string[]) {
        msg.log('source_directories ' + source_directories);
        const spaceToDash = str => str.replace(/ /g, '-');

        const types = ['class', 'function', 'constant', 'mapper', 'value map'];

        let code_info: any = {};
        for (let type of types) {
            code_info[spaceToDash(type)] = {};
        }
        code_info.author = {};

        for (let dir of source_directories) {
            if (!fs.existsSync(dir)) {
                continue;
            }

            let files = filesInDir(path.join(this.project.folder, dir), canBeParsed);

            while (files.length) {
                let command_parts = files.splice(0, object_chunk_length);
                command_parts.unshift(object_parser_command);
                const command: string = command_parts.join(' ');

                const result: Buffer = child_process.execSync(command);
                const objects: any[] = JSON.parse(result.toString());

                for (let obj of objects) {
                    const author = obj.tags.author || obj.tags.serviceauthor;
                    if (author) {
                        code_info.author[author] = { name: author };
                    }

                    if (!types.includes(obj.type)) {
                        continue;
                    }
                    if (obj.type === 'function' && obj.tags.type !== 'GENERIC') {
                        continue;
                    }

                    code_info[spaceToDash(obj.type)][obj.tags.name] = {
                        name: obj.tags.name,
                        desc: obj.tags.desc,
                    };
                }
            }
        }

        this.code_info = {};
        for (let obj_type in code_info) {
            this.code_info[obj_type] = Object.keys(code_info[obj_type]).map(key => code_info[obj_type][key]);
        }
//        msg.log(JSON.stringify(this.code_info, null, 4));

        this.pending = false;
        msg.log(t`CodeInfoUpdateFinished ${this.project.folder}` + ' ' + new Date().toString());
    }

    get update_pending(): boolean {
        return this.pending;
    }
}

const dummy_data = {
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

const dummy_base_classes = [
    {
        name: 'QorusService1',
        desc: 'Service class 2',
    },
    {
        name: 'QorusService2',
        desc: 'Service class 2',
    },
];
