setInterval(() => {
    console.log('작업');
    try {
      throw new Error('서버 고장!');
    } catch (err) {
      console.error(err);
    }
  }, 1000);