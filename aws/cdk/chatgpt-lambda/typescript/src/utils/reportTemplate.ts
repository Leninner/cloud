export const setReportTemplate = (body: string) => {
    return `
    <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnobot</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #dfecff;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
        }

        .container {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #ccc;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            max-width: 800px;
        }

        h1 {
            text-align: center;
        }
        h2 {
            margin-bottom: 10px;
          }
        p {
        margin-bottom: 20px;
        }
        ul {
        margin-bottom: 20px;
        }
        li {
        margin-bottom: 10px;
        }

        img {
            display: block;
            margin: 0 auto;
            max-width: 100%;
        }

        table {
            border-collapse: collapse;
            border: 1px solid #333;
        }

        th, td {
            border: 1px solid #333;
            padding: 10px;
        }

        tr {
            background-color: #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://uploads-ssl.webflow.com/63cad8453a048d41ee9ce6bb/63cad8453a048da4c09ce7f3_logo.svg" alt="Tinkin Tech">
        ${body}
    </div>
</body>
</html>
    `;
};
