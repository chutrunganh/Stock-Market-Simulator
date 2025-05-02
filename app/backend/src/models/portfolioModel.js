class Portfolio{
    constructor(portfolioData){        this.portfolio_id = portfolioData.portfolio_id;
        this.user_id = portfolioData.user_id;
        this.cash_balance = portfolioData.cash_balance;
        this.total_value = portfolioData.total_value;
        this.creation_date = portfolioData.creation_date;
        this.last_updated = portfolioData.last_updated;
    }

    static getPortfolio(portfolioData){
        if (!portfolioData) return null; //if portfolioData is not exist, return null
        return {            portfolio_id: portfolioData.portfolio_id,
            user_id: portfolioData.user_id,
            cash_balance: portfolioData.cash_balance,
            total_value: portfolioData.total_value,
            creation_date: portfolioData.creation_date,
            last_updated: portfolioData.last_updated
        };
    }
}

export default Portfolio;