.DEFAULT_GOAL = less
BOOTSTRAP_LESS = ./less/bootstrap.less
BOOTSTRAP_RESPONSIVE_LESS = ./less/responsive.less

run: 
	jekyll --server

less: 
	./node_modules/.bin/lessc ${BOOTSTRAP_LESS} > ./css/bootstrap.css
	./node_modules/.bin/lessc --compress ${BOOTSTRAP_LESS} > ./css/bootstrap.min.css
	./node_modules/.bin/lessc ${BOOTSTRAP_RESPONSIVE_LESS} > ./css/bootstrap-responsive.css
	./node_modules/.bin/lessc --compress ${BOOTSTRAP_RESPONSIVE_LESS} > ./css/bootstrap-responsive.min.css

clean:
	rm -f ./css/bootstrap*.css ./css/hmt*.css

.PHONY: clean less run
