module.exports = {
	buildCacheBusterString: (function () {
	  var chars = 'a b c d e f g h i j k l m n o p q r s t u v w x y z A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' ');
	  var numbers = '0 1 2 3 4 5 6 7 8 9'.split(' ');
	  var numchars = chars.concat(numbers);
	  return function (len) {
	    var value = chars[Math.floor(Math.random() * chars.length)];
	    while (value.length < len) {
	      value += numchars[Math.floor(Math.random() * numchars.length)];
	    }
	    return value;
	  };
	})(),
	buildPaths: function (config, environment) {
		var destRoot = (function(env){
			if(env === 'dev') return config.dir.root.dev;
			else if(env === 'rc') return config.dir.root.rc;
			else if(env === 'production') return config.dir.root.production;
			else throw new Error('Invalid environment requested');
		})(environment);
		// var destRoot = (isDevelopment ? config.dir.root.dev: config.dir.root.dist);
		return {
			root: './' + destRoot,
			
			scripts: './' + config.dir.root.src + config.dir.type.source.scripts,
			views: './' + config.dir.root.src + config.dir.type.source.views,
			styles: './' + config.dir.root.src + config.dir.type.source.styles,

			js: './' + destRoot + config.dir.type.destination.js,
			css: './' + destRoot + config.dir.type.destination.css,
			html: './' + destRoot + config.dir.type.destination.html
		}
	}
};