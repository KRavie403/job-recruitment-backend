router.get("/scrape", async (req, res) => {
  try {
    const url = "https://www.saramin.co.kr/zf_user/jobs/list";
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);
    const jobs = [];
    
    $(".item_recruit").each((index, element) => {
      const title = $(element).find("h2.job_tit").text().trim();
      const company = $(element).find("strong.corp_name").text().trim();
      const location = $(element).find("div.job_condition").text().trim();
      const detailUrl = $(element).find("a").attr("href");

      if (title && company && location && detailUrl) {
        jobs.push({ title, company, location, detailUrl });
      }
    });

    // DB에 저장
    for (let job of jobs) {
      const query = `
        INSERT INTO jobs (title, company, location, detail_url) 
        VALUES (?, ?, ?, ?)
      `;
      await new Promise((resolve, reject) => {
        db.query(query, [job.title, job.company, job.location, job.detailUrl], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    res.status(200).json({
      message: "Crawling complete and data saved",
      data: jobs,
    });
  } catch (error) {
    console.error("Error during web scraping:", error);
    res.status(500).json({
      message: "Error during web scraping",
    });
  }
});
