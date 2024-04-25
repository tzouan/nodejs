//all data widgets
webix.proxy.socket = {
	$proxy:true, timer: 5, connectAttempt: 1,
	load:function(view) {
		this.socket = new WebSocket("wss:"+this.source);
		this.socket.onerror = (error) => {console.log("WebSocket Error", error, this);};
		//this.socket.onerror = (error) => onError.call(this, error);
		this.socket.onmessage = (e) => onMessage.call(this, e, view);

		view.attachEvent("onDestruct", () => {
			this.socket.close();
		});
	},
	save:function(view, update) {
		update.clientId = this.clientId;
		update.key = this.key;
		this.socket.send(webix.stringify(update));
	}
};

function onError(error) {
	webix.message({
		type: 'error',
		text: 'Δεν υπάρχει σύνδεση με τον διακομιστή, επανασύνδεση σε ' + this.timer * this.connectAttempt + ' δευτ.'
	});

	if (this.connectAttempt < 2) {
		webix.message("Attempt number " + this.connectAttempt);
		setTimeout(
			() => {
				this.socket = new WebSocket("wss:" + this.source);

				this.socket.onerror = (error) => onError.call(this, error);
				this.socket.onmessage = (e) => onMessage.call(this, e);

				this.connectAttempt++;
			},
			this.timer * this.connectAttempt * 2000
		);
	}
}

function onMessage(e, view) {
	var update = webix.DataDriver.json.toObject(e.data);
	if (update.key != this.key) return;

	if (update.clientId == this.clientId) {
		if (update.operation == "insert")
			view.data.changeId(update.id, update.data.id);
	} else {
		webix.dp(view).ignore(() => {
			if (update.operation == "delete")
				view.remove(update.data.id);
			else if (update.operation == "insert")
				view.add(update.data);
			else if (update.operation == "update") {
				view.updateItem(update.data.id, update.data);
			}
		});
	}
}

//Comments widget
webix.proxy.comments = {
	init:function(){
		webix.extend(this, webix.proxy.socket);
	},
	load:function(view){
		webix.proxy.socket.load.call(this, view.queryView("list"));
	}
};