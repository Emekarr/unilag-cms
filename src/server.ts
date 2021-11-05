import("./app").then((server) => {
  server.default.listenWithSocket(process.env.PORT!, () => {
    console.log(`SERVER UP AND RUNNING ON PORT : ${process.env.PORT}`);
  });
});
