/*
 *	Get template
 *
 */
Handlebars.getTemplate = function(name) {
	if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
		$.ajax({
			url : '/app/templates/partials/' + name + '.handlebars',
			success : function(data) {
				if (Handlebars.templates === undefined) {
					Handlebars.templates = {};
				}
				Handlebars.templates[name] = Handlebars.compile(data);
			},
			async : false
		});
	}
	return Handlebars.templates[name];
};

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

	switch (operator) {
		case '==':
			return (v1 == v2) ? options.fn(this) : options.inverse(this);
		case '===':
			return (v1 === v2) ? options.fn(this) : options.inverse(this);
		case '<':
			return (v1 < v2) ? options.fn(this) : options.inverse(this);
		case '<=':
			return (v1 <= v2) ? options.fn(this) : options.inverse(this);
		case '>':
			return (v1 > v2) ? options.fn(this) : options.inverse(this);
		case '>=':
			return (v1 >= v2) ? options.fn(this) : options.inverse(this);
		case '&&':
			return (v1 && v2) ? options.fn(this) : options.inverse(this);
		case '||':
			return (v1 || v2) ? options.fn(this) : options.inverse(this);
		default:
			return options.inverse(this);
	}
});

Handlebars.registerHelper('formatDate', function (date, format)
{
	return moment(date).format(format);
});

Handlebars.registerHelper('formatPreformattedDate', function (date, format, formatDate)
{
	return moment(date, formatDate).format(format);
});

Handlebars.registerHelper('eachReverse', function(context)
{
	var options = arguments[arguments.length - 1];
	var ret = '';

	if (context && context.length > 0) {
		for (var i = context.length - 1; i >= 0; i--) {
			ret += options.fn(context[i]);
		}
	} else {
		ret = options.inverse(this);
	}

	return ret;
});
