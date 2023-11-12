import { Component } from "react";

class DesktopNotification extends Component {
    constructor() {
        super();
        this.showNotification = this.showNotification.bind(this);
    }

    componentDidMount() {
        if (!("Notification" in window)) {
            console.log("Browser does not support desktop notification");
        } else {
            Notification.requestPermission();
        }
    }

    showNotification(title, body, url) {
        const storedTimestamp = window.localStorage.getItem('last_notification') || 0 ;
        const currentTimestamp = new Date().getTime();
        if( currentTimestamp - storedTimestamp < 1000) {
            return;
        }
        window.localStorage.setItem('last_notification', currentTimestamp);
        var options = {
            body: body,
            icon: "https://bzo.bosch.com/bzo/media/css/img/bosch_logo_w260.png",
            dir: 'ltr',
        };
        var notification = new Notification(title, options)
        notification.onclick = function (event) {
            window.open(url, '_blank');
        }

    }
}

export default DesktopNotification;