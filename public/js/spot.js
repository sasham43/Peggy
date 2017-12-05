(function($){

  $('#go').on('click', function(){
    $.ajax('/spotify/auth', function(err, response){
      if(err)
        console.log('err:', err);

      console.log('response', response);
    })
  })
})(jQuery);
