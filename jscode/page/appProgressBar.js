function ProgressBar (rootId, id) {

  var self = this;
  this.id = id;
  this.delay = 1000;
  this.node = {};
  this.barNode = {};

  this.isActive = false;

  this.show = function(position, style, type) {

    self.isActive = true;

    var rootNode = $('#' + rootId);


    var barNodeHtml =  '<div class="bar" style="width: ' + position + '%"></div>';;
    self.barNode = $(barNodeHtml);

    var nodeHtml =  '<div id="' + self.id + '" class="progress hide"></div>';
    self.node = $(nodeHtml);

    self.node.append(self.barNode);
    rootNode.append(self.node);

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
    var styleText = 'width: ' + position + '%;';
    self.barNode.attr('style', styleText);

    if (position > 0) {
      self.node.addClass('active'); 
    }
    if (position == 0 || position == 100) {
      self.node.removeClass('active'); 
    }
    if (style) {
      self.node.removeClass('progress-striped');
      self.node.addClass('progress-' + style); // striped
    }
    if (type) {
      self.node.addClass('progress-info progress-success progress-warning progress-danger'); // info, success, warning, danger
      self.node.addClass('progress-' + type); // info, success, warning, danger
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