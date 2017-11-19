module.exports = {
	apps : [{
		name            : "injectify-server",
		script          : "./main.js",
		log_date_format : "DD/MM/YY [hh:mm]",
		node_args    	  : [
			"--inspect-port=0.0.0.0:18999"
		],
		args           : [
			"--color"
		],
		watch           : false,
		env							: {
			"NODE_ENV"		: "production",
		}
	}]
}
