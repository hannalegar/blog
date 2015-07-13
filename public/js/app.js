$('#show-comments').click(function () {
	$(this).hide();
	$('#comments').slideDown();
	$('input').slideDown();
});

$('#post-comment').submit(function (e) {
	$.post(this.action, {
		author: $('#c-author').val(),
		content: $('#content').val()
	}, function (data){
		console.log(data, this);
		if (data.author === "Nincs megadva szerző!") {
			$('#invalid-a').text(data.author).show();
		}
		if (data.content === "Nincsen tartalom!") {
			$('#invalid-c').text(data.content).show();
		}
	});
	e.preventDefault();
})
