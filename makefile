VERSION := $(shell cat ./src/ui/package.json | grep version\": | sed -e 's/\<version\>//g' -e 's/[",: ]//g')
DIR := inky_dash_v$(VERSION)

package: clean all
	@mkdir -p $(DIR)
	@cp app.js $(DIR)
	@cp -R src $(DIR)
	@cp -R current_image $(DIR)
	@cp -R node_modules $(DIR)
	@cp -R python-scripts $(DIR)
	@mv $(DIR)/src/ui/build $(DIR)/src
	@rm -rf $(DIR)/src/ui/*
	@mv $(DIR)/src/build $(DIR)/src/ui/
	tar -zcf $(DIR).tar.gz $(DIR)

all: clean
	npm run build-all

clean:
	@rm -rf inky_dash_v*
	@rm -rf node_modules
	@rm -rf src/ui/node_modules

