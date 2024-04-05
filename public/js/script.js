$(document).ready(function(){
  // Check if the current page is the chatbot index.html
  if (window.location.pathname.includes('/chatbot/index.html')) {
      $('#chat-icon').hide(); // Hide the chat icon
  }

  $('#chat-icon').click(function(){
      // This code will execute only if the chat icon is clicked
      // You can add more actions here, such as showing the chat window
  });
});

(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()