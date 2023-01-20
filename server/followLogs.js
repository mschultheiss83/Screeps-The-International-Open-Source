const { followLog, setHostname } = require("./helper");
const { playerRoom, rooms } = require("./config");

async function main() {
  if (process.argv.length > 2) {
    setHostname(process.argv[2]);
  }
  followLog(rooms, undefined, playerRoom);
}
main();
