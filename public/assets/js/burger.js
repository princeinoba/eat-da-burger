//Devour button functionality
document.querySelectorAll('.devour').forEach(button => {
  button.addEventListener('click', function(event) {
    const id = this.parentElement.getAttribute('data-id');
    const newDevour = this.parentElement.getAttribute('data-newdevoured');

    fetch(`api/burgers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type' : 'application/json' },
      body: JSON.stringify({ devoured: newDevour }),
    }).then(response => {
      if (response.ok) location.reload();
    });
  });
});

//Add new burger
document.getElementById('add-burger').addEventListener('submit', function(event) {
  event.preventDefault();
  const newBurger = {
    burger_name: document.getElementById('burger-name').value.trim(),
  }

  fetch(`/api/burgers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newBurger),
  }).then(response => {
    if (response.ok) location.reload();
  });
});

//Delete burgers
document.querySelectorAll('.delete').forEach(button => {
  button.addEventListener('click', function(event) {
    const id = this.parentElement.getAttribute('data-id');

    fetch(`api/burgers/${id}`, {
      method: 'DELETE'
    }).then(response => {
      if (response.ok) location.reload();
    });
  });
});