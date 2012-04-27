.DEFAULT_GOAL = less
BOOTSTRAP_LESS = ./less/bootstrap.less
BOOTSTRAP_RESPONSIVE_LESS = ./less/responsive.less
HMT_LESS = ./less/hmt.less
JS = ./js/bootstrap.custom.js ./js/hmt.js
JS_MIN = ./js/hmt.min.js

run: 
	jekyll --server

less: 
	./node_modules/.bin/lessc ${BOOTSTRAP_LESS} > ./css/bootstrap.css
	./node_modules/.bin/lessc --compress ${BOOTSTRAP_LESS} > ./css/bootstrap.min.css
	./node_modules/.bin/lessc ${BOOTSTRAP_RESPONSIVE_LESS} > ./css/bootstrap-responsive.css
	./node_modules/.bin/lessc --compress ${BOOTSTRAP_RESPONSIVE_LESS} > ./css/bootstrap-responsive.min.css
	./node_modules/.bin/lessc ${HMT_LESS} > ./css/hmt.css
	./node_modules/.bin/lessc --compress ${HMT_LESS} > ./css/hmt.min.css

js: 
	cat $(JS) | ./node_modules/.bin/uglifyjs -o $(JS_MIN)

clean:
	rm -f ./css/bootstrap*.css ./css/hmt*.css ./js/*.min.js

.PHONY: clean less run js
