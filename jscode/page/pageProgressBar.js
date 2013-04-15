function ProgressBar (rootId, title) {

	var self = this;
	var delay = 5000;
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
		console.log('Update bar started: ' + current + ' of ' + total);

		captionNode.empty();

		var position = 0;
		var captionText;
		captionText = 'Loading ' + caption + ' issues...';

		if (total != 'none') {
			position = Math.round((current/total)*100 );
			captionText = 'Loading ' + caption + ' issues: ' + current + ' of ' + total;
		}
		captionNode.text(captionText);

		if (total == 0) {
			position = 100;
		}

		var styleText = 'width: ' + position + '%;';
		barSubNode.attr('style', styleText);

		if (style) {
		  barNode.removeClass('progress-striped');
		  barNode.addClass('progress-' + style); // striped
		}
		if (type) {
		  barNode.removeClass('progress-info progress-success progress-warning progress-danger'); 
		  barNode.addClass('progress-' + type); // info, success, warning, danger
		}

		if (position == 0) {
		  barNode.removeClass('active'); 
		  barNode.removeClass('progress-info progress-success progress-warning progress-danger'); 
		}
		if (position > 0) {
		  barNode.addClass('active'); 
		  barNode.removeClass('progress-success'); 
		}
		if (position == 100) {
		  console.log(' - Removing style active');
		  barNode.removeClass('active'); 
		  barNode.removeClass('progress-info progress-success progress-warning progress-danger'); 
		  barNode.addClass('progress-success');

		  self.hide();
		}

	}

  this.hide = function() {
    mainNode.delay(delay).fadeOut();
  }

  this.remove = function() {
    mainNode.remove();
  }

}