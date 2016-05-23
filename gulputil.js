var fs = require('fs');
var _ = require('lodash');

module.exports = {
	buildCacheBusterString: (function () {
	  var chars = 'a b c d e f g h i j k l m n o p q r s t u v w x y z A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' ');
	  var numbers = '0 1 2 3 4 5 6 7 8 9'.split(' ');
	  var numchars = chars.concat(numbers);
	  return function (len) {
      return _.chain(_.range(len))
        .map(function (v, i) { return i > 0 ? _.sample(numchars) : _.sample(chars) })
        .join('')
        .value();
	  };
	})(),
	pIsFileAvaliable: function (path) {
		return new Promise(function (res) {
			fs.lstat(path, function(err, stats) {
				if (!err && stats.isFile()) {
					res(true);
				} else { res(false); }
			});
		})
	}
};