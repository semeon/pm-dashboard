function DataController(){

  var self = this;
  this.prevRequestCounter = 0;
  this.pendingRequestCounter = 0;
  this.totalRequestCounter = 0;

  
  this.genericRequest = function(requestUri, requestParams, callback) {
    self.pendingRequestCounter++;
    self.totalRequestCounter++;

    $.getJSON(
              requestUri,
              requestParams,
              function(data) {
                self.pendingRequestCounter--;
                callback(data, requestParams);
              }
             );
  }  


}