var logID = 'log';
  var body = document.querySelector('body');
  var type = document.querySelectorAll('[type*="radio"]');
  var log = document.createElement('div');
  body.appendChild(log);
  type.onchange (function () {
	  var me = this;
	  log.innerHTML(me.getAttribute('value'));
  });