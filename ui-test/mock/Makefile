
# current date
DATE=$(shell qore -nX 'now().format("YYYY-MM-DD")')

# the demo block release version
VERSION=1.0-$(DATE)

#top_srcdir := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

DEMO_COMMON_FILES=$(shell find demo-lib -name \*.q\* | sort)

DEMO_TELCO_OM_FILES=$(shell find telco-om -name \*.q\* | sort)

DEMO_ERP_FILES=$(shell find erp -name \*.q\* | sort)

DEMO_CRM_TO_ERP_FILES=$(shell find demo-scripts/crm-to-erp/java -name \*.q\* -o -name \*java | sort)

DEMO_RABBITMQ_FILES=$(shell find rabbit-mq -name \*.q\* ! -name \*.qm | sort)
DEMO_RABBITMQ_JAVA=$(shell find rabbit-mq -name \*.jar -type f | sort)
DEMO_RABBITMQ_MODULES=modules/RabbitMQConnection.qm
DEMO_RABBITMQ_QSCRIPT=rabbit-mq/BB_RabbitMQ.qscript

DEMO_JAVA=${DEMO_RABBITMQ_JAVA}

DEMO_ALL_FILES=${DEMO_COMMON_FILES} ${DEMO_TELCO_OM_FILES} ${DEMO_ERP_FILES} ${DEMO_CRM_TO_ERP_FILES} ${DEMO_JAVA}

all:
	@echo "usage: make load-all"
	@echo "  load-all:           load all demo code"
	@echo "  load-erp:           load erp demo code"
	@echo "  load-telco-om:      load telco-om demo code"
	@echo "  load-crm-to-erp:    load crm to erp demo code"
	@echo "  release-all:        make release of all demos"
	@echo "  release-erp:        make erp release"
	@echo "  release-telco-om:   make telco-om release"
	@echo "  release-crm-to-erp: make crm-to-erp release"
	@echo "  run-erp:            run erp demo"
	@echo "  run-telco-om:       run telco-om demo"

dummy:

load-all: load-telco-om load-erp load-crm-to-erp load-rabbitmq

release-telco-om: ${DEMO_COMMON_FILES} ${DEMO_TELCO_OM_FILES}
	make-release -cfU. -Puser/demos telco-om-demo-$(VERSION) $^

release-erp: ${DEMO_COMMON_FILES} ${DEMO_ERP_FILES}
	make-release -cfU. -Puser/demos erp-demo-$(VERSION) $^

release-crm-to-erp: ${DEMO_COMMON_FILES} ${DEMO_CRM_TO_ERP_FILES}
	make-release -cfU. -Puser/demos crm-to-erp-demo-$(VERSION) $^

release-rabbitmq: ${DEMO_RABBITMQ_FILES} ${DEMO_RABBITMQ_JAVA} ${DEMO_RABBITMQ_MODULES}
	# create staging dir
	rm -rf /tmp/stage-rabbitmq
	mkdir -p /tmp/stage-rabbitmq/demos/rabbit-mq
	mkdir /tmp/stage-rabbitmq/jar
	mkdir /tmp/stage-rabbitmq/modules
	# copy qore files to staging
	cp -apR ${DEMO_RABBITMQ_FILES} /tmp/stage-rabbitmq/demos/rabbit-mq/
	# copy module to staging
	cp -apR ${DEMO_RABBITMQ_MODULES} /tmp/stage-rabbitmq/modules
	# copy jar files to the staging dir
	for jar in ${DEMO_RABBITMQ_JAVA}; do \
		dir=`dirname "$$jar"|sed s/rabbit-mq\\\/jar//`; echo DIR="$$dir"; \
		target_dir="/tmp/stage-rabbitmq/jar/$$dir"; \
		if [ ! -d "$$target_dir" ]; then \
			echo creating "$$target_dir"; \
			mkdir -p "$$target_dir"; \
		fi; \
		cp "$$jar" "$$target_dir"; \
	done
	cd /tmp/stage-rabbitmq && pwd && make-release -cfU. -Puser rabbitmq-demo-$(VERSION) `find . -type f`
	#rm -rf /tmp/stage-rabbitmq

release-all: ${DEMO_ALL_FILES}
	make-release -cfU. -Puser/demos demo-all-$(VERSION) $^

load-telco-om: ${DEMO_COMMON_FILES} ${DEMO_TELCO_OM_FILES}
	# make a temporary load file
	make-release -l/tmp/telco-om.qrf -U. $^
	# load the release
	oload /tmp/telco-om.qrf -lvRA
	# delete the temporary load file
	rm /tmp/telco-om.qrf

run-telco-om: dummy
	./telco-om/telco-om-create-orders.sh

load-erp: ${DEMO_COMMON_FILES} ${DEMO_ERP_FILES}
	# make a temporary load file
	make-release -l/tmp/demo-erp.qrf -U. $^
	# load the release
	oload /tmp/demo-erp.qrf -lvRA
	# delete the temporary load file
	rm /tmp/demo-erp.qrf

load-crm-to-erp: ${DEMO_COMMON_FILES} ${DEMO_CRM_TO_ERP_FILES}
	# make a temporary load file
	make-release -l/tmp/demo-erp.qrf -U. $^
	# load the release
	oload /tmp/demo-erp.qrf -lvRA
	# delete the temporary load file
	rm /tmp/demo-erp.qrf

load-rabbitmq: ${DEMO_RABBITMQ_FILES}
	# copy jar files to the target dir
	for jar in ${DEMO_RABBITMQ_JAVA}; do \
		dir=`dirname "$$jar"`; \
		target_dir="$$OMQ_DIR/user/jar/$$dir"; \
		if [ ! -d "$$target_dir" ]; then \
			echo creating "$$target_dir"; \
			mkdir -p "$$target_dir"; \
		fi; \
		cp "$$jar" "$$target_dir"; \
	done
	# copy modules to $OMQ_DIR/user/modules
	mkdir -p ${OMQ_DIR}/user/modules
	for mod in ${DEMO_RABBITMQ_MODULES}; do \
		cp $$mod ${OMQ_DIR}/user/modules; \
	done
	# make a temporary load file
	make-release -l/tmp/rabbitmq.qrf -U. $^
	# load the release
	oload /tmp/rabbitmq.qrf -lvRA
	# delete the temporary load file
	rm /tmp/rabbitmq.qrf

run-erp: dummy
	./erp/erp-create-orders.sh
