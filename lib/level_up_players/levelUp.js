module.exports.createNamesMessage = (stdout) => {
  const spacing = 25;
  var result = "```\n";

  var names = stdout.split("\n");
  names.forEach((name, i) => {
    if (name == "Carter Hart") {
      name = name + " Fuck this Guy";
    }
    if (i != names.length - 1) {
      if (i % 2 == 0) {
        // Needs the spacing
        result = `${result}${name.padEnd(spacing)}`;
      } else {
        // In the second columns
        result = `${result}${name}\n`;
      }
    }
  });
  return result + "```";
};
