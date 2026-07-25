<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Hyeonsu BioPolicy</title>

  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f7f9;
      color: #1f2937;
    }

    header {
      background-color: #123b5d;
      color: white;
      padding: 50px 20px;
      text-align: center;
    }

    header h1 {
      margin: 0;
      font-size: 40px;
    }

    header p {
      margin-top: 15px;
      font-size: 18px;
    }

    main {
      max-width: 1100px;
      margin: 40px auto;
      padding: 0 20px;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-top: 25px;
    }

    .card {
      background-color: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .card h3 {
      margin-top: 0;
    }

    .value {
      margin-top: 15px;
      font-size: 34px;
      font-weight: bold;
      color: #123b5d;
    }

    footer {
      margin-top: 50px;
      padding: 20px;
      text-align: center;
      color: #6b7280;
    }
  </style>
</head>

<body>

  <header>
    <h1>Hyeonsu BioPolicy</h1>
    <p>바이오정책 데이터와 정책 인텔리전스 플랫폼</p>
  </header>

  <main>

    <h2>바이오정책 핵심지표</h2>

    <div class="cards">

      <div class="card">
        <h3>정책자료</h3>
        <div class="value">0건</div>
      </div>

      <div class="card">
        <h3>국가 R&D 사업</h3>
        <div class="value">0건</div>
      </div>

      <div class="card">
        <h3>법령·규제</h3>
        <div class="value">0건</div>
      </div>

      <div class="card">
        <h3>글로벌 동향</h3>
        <div class="value">0건</div>
      </div>

    </div>

  </main>

  <footer>
    BioPolicy Intelligence Dashboard
  </footer>

</body>
</html>
