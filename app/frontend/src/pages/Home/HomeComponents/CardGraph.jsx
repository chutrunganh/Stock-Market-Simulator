import React from 'react';
import './CardGraph.css';
import hust1 from '../../../assets/images/hust1.jpg';
import hust2 from '../../../assets/images/hust2.jpg';
import gold from '../../../assets/images/gold.jpeg';

function CardGraph() {
    return (
        <div className="CardGraph">
            <a href="https://hust.edu.vn/vi/news/khoa-hoc-cong-nghe-dmst/dai-hoc-bach-khoa-ha-noi-dam-nghi-lon-hanh-dong-lon-655458.html" target="_blank" rel="noopener noreferrer">
                <img src={hust1} alt="hust new" />
                <div className="card-title">Đại học Bách khoa Hà Nội dám nghĩ lớn, hành động lớn!</div>
                <div className="card-date">20/05/2025</div>
            </a>
            <a href="https://hust.edu.vn/vi/news/tin-tuc-su-kien/ban-linh-dot-pha-de-chinh-phuc-cac-muc-tieu-655443.html" target="_blank" rel="noopener noreferrer">
                <img src={hust2} alt="hust new" />
                <div className="card-title">Bản lĩnh, đột phá để chinh phục các mục tiêu</div>
                <div className="card-date">18/05/2025</div>
            </a>
            <a href="https://vietstock.vn/2025/05/vang-the-gioi-tang-hon-2-sau-dong-thai-cua-ong-trump-759-1311744.htm" target="_blank" rel="noopener noreferrer">
                <img src={gold} alt="hust new" />
                <div className="card-title">Vàng thế giới tăng hơn 2% sau động thái của ông Trump</div>
                <div className="card-date">24/05/2025</div>
            </a>
        </div>
    );
}

export default CardGraph;