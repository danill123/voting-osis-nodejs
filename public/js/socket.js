const socket = io()

socket.on("data", (data) => {
    // change DOM element for live chart / output pooling data
    chart_area(data.id, data.rsl)
})