function ProgressBar (rootId, id) {

  var self = this;
  this.id = id;
  this.delay = 1000;
  this.node = $('<div id="' + id + '" class="progress hide"></div>');
  this.barNode = $('<div class="bar" style="width: 0%"></div>');
  this.isActive = false;

  self.node.append(self.barNode);
  $('#' + rootId).append(self.node);



  this.show = function(position, style, type) {
    self.isActive = true;

    if (position > 0) {
      self.node.addClass('active'); 
    }
    if (style) {
      self.node.addClass('progress-' + style); // striped
    }
    if (type) {
      self.node.addClass('progress-' + type); // info, success, warning, danger
    }
    
    self.node.fadeIn();
  }


  this.update = function(position, style, type) {
    console.log('Update bar started');

    var styleText = 'width: ' + position + '%;';
    self.barNode.attr('style', styleText);

    if (position > 0) {
      self.node.addClass('active'); 
    }
    if (style) {
      self.node.removeClass('progress-striped');
      self.node.addClass('progress-' + style); // striped
    }
    if (type) {
      self.node.removeClass('progress-info progress-success progress-warning progress-danger'); // info, success, warning, danger
      self.node.addClass('progress-' + type); // info, success, warning, danger
    }
    if (position == 0 || position == 100) {
      console.log(' - Removing style active');
      self.node.removeClass('active'); 
      self.node.removeClass('progress-info progress-success progress-warning progress-danger'); // info, success, warning, danger
      self.node.addClass('progress-success');

    }
  }

  this.hide = function(remove) {
    self.node.fadeOut(self.delay, 
                      function(){ 
                        if (remove) {
                          $(this).remove();
                        }
                       
                     });
    self.isActive = false;
  }

  this.remove = function() {
    self.node.remove();
    self.isActive = false;
  }

}