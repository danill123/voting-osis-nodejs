const socket = io()

socket.on("data", (data) => {
    // change DOM element for live chart / output pooling data
    chart_area(data.id, data.rsl)
})

// request data setiap 2 detik
setInterval(() => {
    socket.emit("get_data", "send")
}, 2000);