create table h3g_it_gl_int_header (
  message_id numeric(15) not null,
  source_system varchar(50) not null,
  target_system varchar(50) not null,
  int_status varchar(10) not null,
  message_type varchar(50) not null,
  creation_date date not null,
  status_start timestamp(6),
  status_end timestamp(6),
  record_count numeric,
  ctrl_sum numeric,
  qorus_wfiid numeric,
  ref_transfer varchar(150),
  request_id numeric,
  ledger_id numeric,
  group_id numeric,
  parent_message_id numeric,
  feedback varchar(240),
  ready_for_upload varchar(1),
  error_message varchar(2000)
);
create unique index h3g_it_gl_int_header_n2 on h3g_it_gl_int_header (message_id) tablespace omquser_index;
create index h3g_it_gl_int_header_n1 on h3g_it_gl_int_header (qorus_wfiid) tablespace omquser_index;
