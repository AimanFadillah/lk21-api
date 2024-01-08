import express from "express";
import cors from "cors";
import cheerio from "cheerio";
import axios from "axios";

const app = express();
const port = 5000;

app.use(cors());

app.get("/search",async (req,res) => {
    const response = await axios.get(`https://tv7.lk21official.wiki/search.php?s=${req.query.s}`);
    const $ = cheerio.load(response.data);
    const data = [];
    $(".search-wrapper").find("div.search-item").each((index,element) => {
        data.push({
            nama:$(element).find(".search-content h3 > a").text(),
            image:$(element).find(".search-poster > figure > a > img").attr("src"),
            slug:$(element).find(".search-poster > figure > a").attr("href").split("/")[1]
        });
    });
    return res.json(data);
});

app.get("/movie",async (req,res) => {
    try{
        const response = await axios.get(`https://tv7.lk21official.wiki/TOP-MOVIE-TODAY/page/${req.query.page || 1}/`);
        const $ = cheerio.load(response.data);
        const data = [];
        $("#grid-wrapper").find("div.col-lg-2").each((index,element) => {
            data.push({
                nama:$(element).find("h1.grid-title > a").text().trim(),
                image:$(element).find("picture > img").attr("src"),
                time:$(element).find(".duration").text(),
                quality:$(element).find(".quality").text(),
                slug:($(element).find(".grid-poster > a").attr("href")).split("/")[3],
            })
        });
        return res.json(data);
    }catch(e){
        return res.json(e);
    }
});

app.get("/movie/:slug",async (req,res) => {
    try{
        const response = await axios.get(`https://tv7.lk21official.wiki/${req.params.slug}/`);
        const $ = cheerio.load(response.data);
        const nama = ($(".post-header > h2").text()).split(" Film Subtitle Indonesia Streaming / Download")[0];
        const mirror = [];
        function getInformasi (index) {
            return $(".col-xs-9").find("div").eq(index).find("h3").text()
        }
        $("#loadProviders").find("li").each((index,element) => {
            mirror.push({
                nama:$(element).find("a").text(),
                src:$(element).find("a").attr("href"),
            })
        });
        const data = {
            nama,
            kualitas:getInformasi(0),
            negara:getInformasi(1),
            bintangFilm:getInformasi(2),
            sutradara:getInformasi(3),
            genre:getInformasi(4),
            imdb:$(".col-xs-9").find("div").eq(5).text().split("IMDb")[1],
            terbit:getInformasi(6),
            deskripsi:($("blockquote").text()).split(nama)[1].trim().split(".")[0],
            iframa:$("#loadPlayer > iframe").attr("src"),
            mirror,
            download:$("#download-movie").find("a").eq(0).attr("onclick").split("'")[1],
        };
        return res.json(data);
    }catch(e){
        return res.json(e);
    }
})

app.get(".")

app.listen(port,() =>  console.log(`Server on http://localhost:${port}/`));