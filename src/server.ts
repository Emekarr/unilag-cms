import("./app").then((server) => {
  server.default.listen(process.env.PORT!, () => {
    console.log(`SERVER UP AND RUNNING ON PORT : ${process.env.PORT}`);
  });
});
