function AppAlert (rootId, id) {

  var self = this;
  this.id = id;
  this.delay = 1000;
  this.node = {};
  this.isActive = false;

  this.show = function(text, type) {
    self.isActive = true;

    var rootNode = $('#' + rootId);
    self.node = $('<div id="' + self.id + '" class="alert"></div>');
    rootNode.append(self.node);
    if (type) {
      self.node.addClass('alert-' + type);
    }
    self.node.append(text);
    self.node.fadeIn();
  }

  this.update = function(text, type) {

    self.node.empty();
    if (type) {
      self.node.removeClass('alert-error alert-success alert-info');
      self.node.addClass('alert-' + type);
    }
    self.node.append(text);
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