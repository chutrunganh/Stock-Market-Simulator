> [!NOTE]  
> Nếu bạn chưa có kiến thức về chứng khoán, đọc qua file này để biết các khái niệm cơ bản mà chúng tôi sử dụng trong dự án này

# Các loại lệnh cơ bản

Hiện tại app chúng tôi chỉ hỗ trợ lệnh thị trường và lệnh giới hạn.
# Matching Engine 

Để khớp các lệnh (**Order**) của người dùng, sàn chứng khoán sử dụng một thành phần gọi là **Matching Engine**. Khi một người dùng đặt lệnh mua hoặc bán, thông tin lệnh sẽ được gửi đến Matching Engine. Thành phần này sẽ tìm kiếm các lệnh đối ứng trong hệ thống và thực hiện việc khớp lệnh dựa trên các tiêu chí định trước. Khi một lệnh mua và một lệnh bán được khớp bởi matching engine, giao dịch (**Transaction**) sẽ được thực hiện và thông tin về giao dịch đó sẽ được ghi lại trong cơ sở dữ liệu. Về các tiêu chí mà Matching Engine sử dụng để khớp lệnh gồm 2 cách tiếp cận chính là: **price-time priority system** and **pro-rata system**. Đọc kỹ hơn trong bài viết này: [Order matching system: Explained](https://tiomarkets.com/article/order-matching-system-guide). Trong dự án này, chúng tôi sử dụng tiêu chí giá thời gian.

Theo đó, ta sẽ duy trì một sổ lệnh (**Book Order**) cho mỗi mã cổ phiếu. Thường thì Booker Order sẽ hiển thị 3 giá bán và 3 giá mua tốt nhất (cao nhất cho bids, thấp nhất cho asks) từ các lệnh của người dùng gửi lên (Hiển thị giá và số lượng). *Chỉ hiển thị 3 giá để tiết kiệm không gian còn thực tế Book Order vẫn phải xử lý với tất cả các lệnh trong hàng đợi.*

Khi người dùng gửi lệnh mua/bán cổ phiếu mới lên sàn bao gồm giá + số lượng lên sàn:

- Nếu đó là lệnh thị trường (**Market Order**), quét qua các lệnh trong Book Order và khớp với các lệnh có giá tốt nhất (tức là giá thấp nhất cho lệnh mua và giá cao nhất cho lệnh bán), nếu có hai người bán/mua đưa ra cùng một mức giá thì khớp với người có thời gian đặt lệnh sớm hơn. Sau khi khớp xong thì cập nhật Book Order ở trường "Khớp lệnh" với giá và só lượng của lệnh vừa được khớp.

- Nếu đó là lệnh giới hạn (**Limit Order**), quét qua các lệnh trong Book Order xem có lệnh nào thỏa mãn điều kiện giá không:
    - Nếu có thì thực hiện khớp lệnh (ưu tiên giá xong đến thời gian) và cập nhật Book Order.

    - Nếu không thì lệnh đó được đưa vào hàng đợi của Book Order, chờ cho tới khi:
        - có lệnh đối ứng thì khớp và loại khỏi hàng đợi 
        - nếu không có lệnh đối ứng cho tới cuối phiên giao dịch thì lệnh đó sẽ bị giải tỏa.

Chi tiết hơn xem trong video này: [VN Uptrend Youtube - Thời gian giao dịch và nguyên tắc khớp lệnh chứng khoán](https://youtu.be/3SJRObB-SUk?si=IJGkCBmZT9izFHvR)

Code implementation của Book Order matching tham khảo [Medium-Stock Market Orders Matching Engine in NodeJS](https://jindalujjwal0720.medium.com/stock-market-order-book-orders-matching-engine-in-nodejs-3dff82f70080)

*Cơ chế bên trên ta chỉ đang xét trong phiên khớp lệnh liên tục. Trong phiên làm việc của sàn chứng khoán thì quá trình sẽ là: phiên khớp lệnh định kỳ (ATO) -> phiên khớp lệnh liên tục -> phiên khớp lệnh định kỳ (ATC). Hoặc các phiên khớp lệnh khác nữa tiuy quy định của sàn, cơ chế khớp lệnh tỏng các phiên này có thể khác nhau. Xem cơ chế khớp lệnh trong khớp lệnh định kỳ ATC tại đây: [VN Uptrend Youtube - Khớp lệnh định kỳ ATC](https://youtu.be/8k5EiRoNWtg?si=GzVQjQsGTGURF_TQ).*