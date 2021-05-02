import app from "./App";
import { dbConnection } from "./db";
import { config } from "./config";
import { executeCronJobs } from "./cronjob/executejobs";

const port = config.PORT;

app.listen(port, (err) => {
  new dbConnection().getInstance();
  // executeCronJobs()

  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on ${port}`);
});
