function ProgressBar (rootId, title) {

	var self = this;
	var delay = 1000;
	var caption = title;

	var rootNode = $('#' + rootId);

	var mainNode = $('<div class="hide"></div>');
	rootNode.append(mainNode);

	var captionNode = $('<span>Loading ' + caption + ' issues..<span>');
	mainNode.append(captionNode);

	var barNode = $('<div class="progress active"></div>');
	mainNode.append(barNode);

	var barSubNode = $('<div class="bar" style="width: 0%"></div>');
	barNode.append(barSubNode);



	this.show = function(style, type) {
		if (style) {
			barNode.addClass('progress-' + style); // striped
		}
		if (type) {
			barNode.addClass('progress-' + type); // info, success, warning, danger
		}
		mainNode.fadeIn();
	}


	this.update = function(current, total, style, type) {
		console.log('Update bar started');

		captionNode.empty();
		captionNode.text('Loading ' + caption + ' issues: ' + current + ' of ' + total);
		// captionNode = $('<span>Loading ' + caption + ' issues..<span>');

		var position = Math.round((current/total)*100 );

		var styleText = 'width: ' + position + '%;';
		barSubNode.attr('style', styleText);

		if (position > 0) {
		  barNode.addClass('active'); 
		}
		if (style) {
		  barNode.removeClass('progress-striped');
		  barNode.addClass('progress-' + style); // striped
		}
		if (type) {
		  barNode.removeClass('progress-info progress-success progress-warning progress-danger'); // info, success, warning, danger
		  barNode.addClass('progress-' + type); // info, success, warning, danger
		}
		if (position == 0 || position == 100) {
		  console.log(' - Removing style active');
		  barNode.removeClass('active'); 
		  barNode.removeClass('progress-info progress-success progress-warning progress-danger'); // info, success, warning, danger
		  barNode.addClass('progress-success');
		}
	}

  this.hide = function() {
    mainNode.fadeOut(delay);
  }

  this.remove = function() {
    mainNode.remove();
  }

}