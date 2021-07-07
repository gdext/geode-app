const fs = require("fs");

const html = 
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geode</title>
</head>
<body>
    <script src="bundle.js"></script>
</body>
</html>`;

fs.stat("web/index.html", (e, s) => {
    if (e) fs.writeFileSync("web/index.html", html);
});