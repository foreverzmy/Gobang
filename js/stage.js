var game = {
    type: 1,
    data: null,
    state: 1,
    RUNNING: 1,
    GAMEOVER: 0,
    player: 1,
    ROW: null,
    COL: null,
    myMax: null,
    myWeight: null,
    rivalMax: null,
    rivalWeight: null,
    init: function() { //初始化棋盘函数
        if (this.type === 1) {
            document.body.innerHTML = '<p>五子棋人机对弈</p><p class="change"><a onclick="game.start(2)" onselectstart="return false">双人对战</a> <a onclick="game.start(1)" onselectstart="return false">Try Again!</a></p><div id="gameOver"><p><span id="close">&times;</span>Game Over!<br><span id="winner"></span><br><a class="btn" onclick="game.start(1)" onselectstart="return false">Try Again!</a></p></div>';
        } else {
            document.body.innerHTML = '<p>五子棋双人对弈</p><p class="change"><a onclick="game.start(1)" onselectstart="return false">人机对战</a> <a onclick="game.start(2)" onselectstart="return false">Try Again!</a></p><div id="gameOver"><p><span id="close">&times;</span>Game Over!<br><span id="winner"></span><br><a class="btn" onclick="game.start(2)" onselectstart="return false">Try Again!</a></p></div>';
        }
        var gridPanel = document.createElement("div");
        gridPanel.innerHTML = "";
        gridPanel.setAttribute("id", "gridPanel");
        var chessboard = document.createElement('table');
        chessboard.id = 'chessboard';
        for (let i = 0; i < 14; i++) {
            let tr = document.createElement('tr');
            for (let j = 0; j < 14; j++) {
                let td = document.createElement('td');
                if ((i === 2 || i === 10) && (j === 2 || j === 10) || i === 6 && j === 6) {
                    var oDiv = document.createElement('div');
                    td.appendChild(oDiv);
                }
                tr.appendChild(td);
            }
            chessboard.appendChild(tr);
        }
        var pieces = document.createElement('table');
        pieces.id = 'pieces';
        for (let i = 0; i < 15; i++) {
            let tr = document.createElement('tr');
            for (let j = 0; j < 15; j++) {
                let td = document.createElement('td');
                td.id = 'r' + i + 'c' + j;
                tr.appendChild(td);
            }
            pieces.appendChild(tr);
        }
        gridPanel.appendChild(pieces);
        gridPanel.appendChild(chessboard);
        document.body.appendChild(gridPanel);
    },
    start: function(type) { //开始游戏
        this.type = type;
        this.init(); //初始化棋盘
        this.player = 1; //定义玩家，黑子是1，白字是2
        this.state = this.RUNNING; //棋局是否进行
        this.data = []; //棋盘状态
        this.myWeight = []; //我的棋子权重
        this.rivalWeight = []; //对方棋子的权重
        for (let r = 0; r < 15; r++) { //初始化数组
            this.data[r] = [];
            this.myWeight[r] = [];
            this.rivalWeight[r] = [];
            for (let c = 0; c < 15; c++) {
                this.data[r][c] = 0;
                this.myWeight[r][c] = 0;
                this.rivalWeight[r][c] = 0;
            }
        };
        var pieces = document.getElementById('pieces');
        pieces.addEventListener('click', function(e) { //落子执行的函数
            e.stopPropagation();
            let src = e.target; //获取落子元素
            if (src.id == 'pieces' || src.className) {
                return;
            };
            this.ROW = parseInt(/\d+(?=c)/.exec(src.id)[0]); //获得落子的所在行
            this.COL = parseInt(/\d+$/.exec(src.id)[0]); //获得落子的所在列
            this.data[this.ROW][this.COL] = this.player;
            this.state = this.isGameOver(); //判断游戏有没有结束
            this.updataView(); //更新页面显示
            if (this.state == this.RUNNING && this.type == 1) { //如果游戏没有结束
                this.player = this.player == 1 ? 2 : 1; //交换玩家
                this.maxWeight(); //更新权重
                this.AI(); //AI落子
                this.data[this.ROW][this.COL] = this.player;
                this.state = this.isGameOver(); //判断游戏有没有结束
                this.updataView(); //更新页面显示
            }
            this.player = this.player == 1 ? 2 : 1; //交换玩家
        }.bind(this));
        document.getElementById('close').addEventListener('click', function() {
            document.querySelector('#gameOver p').style.display = 'none';
        })
    },
    AI: function() { //白子AI算法
        console.log('黑子');
        console.table(this.rivalWeight);
        console.log('白子');
        console.table(this.myWeight);
        var max = 0;
        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                if (this.myWeight[r][c] > max) {
                    max = this.myWeight[r][c];
                    this.ROW = r;
                    this.COL = c;
                }
                if (this.rivalWeight[r][c] > max) {
                    max = this.rivalWeight[r][c];
                    this.ROW = r;
                    this.COL = c;
                }
            }
        };
    },
    maxWeight: function() { //算两方的权重
        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                this.myWeight[r][c] = 0;
                this.rivalWeight[r][c] = 0;
            }
        }
        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                if (this.data[r][c] == this.player) { //算己方的权重
                    this.around(r, c); //计算权重
                }
                this.player = this.player == 2 ? 1 : 2;
                if (this.data[r][c] == this.player) { //算对方的权重
                    this.around(r, c); //计算权重
                }
                this.player = this.player == 1 ? 2 : 1;
            }
        }
    },
    around: function(ROW, COL) {
        var max = 0;
        if (ROW != 0 && COL != 0 && this.data[ROW - 1][COL - 1] == 0) { //左上无子
            for (let r = ROW, c = COL; r < 15 && c < 15 && this.data[r][c] == this.player; r++, c++) {
                max++; //从左上往右下数判断连续子有几个
            }
            this.everyWeight(ROW, COL, 1, 1, max);
            max = 0;
        };
        if (COL != 0 && this.data[ROW][COL - 1] == 0) { //左无子
            for (let r = ROW, c = COL; c < 15 && this.data[r][c] == this.player; c++) {
                max++;
            }
            this.everyWeight(ROW, COL, 0, 1, max);
            max = 0;
        };
        if (ROW != 14 && COL != 0 && this.data[ROW + 1][COL - 1] == 0) { //左下无子
            for (let r = ROW, c = COL; r >= 0 && c < 15 && this.data[r][c] == this.player; r--, c++) {
                max++;
            }
            this.everyWeight(ROW, COL, -1, 1, max);
            max = 0;
        };
        if (ROW != 14 && this.data[ROW + 1][COL] == 0) { //下无子
            for (let r = ROW, c = COL; r >= 0 && this.data[r][c] == this.player; r--) {
                max++;
            }
            this.everyWeight(ROW, COL, -1, 0, max);
            max = 0;
        };
        if (ROW != 0 && this.data[ROW - 1][COL] == 0) { //上无子
            for (let r = ROW, c = COL; r < 15 && this.data[r][c] == this.player; r++) {
                max++;
            }
            this.everyWeight(ROW, COL, 1, 0, max);
            max = 0;
        };
        if (ROW != 0 && COL != 14 && this.data[ROW - 1][COL + 1] == 0) { //右上无子
            for (let r = ROW, c = COL; r < 15 && c >= 0 && this.data[r][c] == this.player; r++, c--) {
                max++;
            };
            this.everyWeight(ROW, COL, 1, -1, max);
            max = 0;
        };
        if (COL != 14 && this.data[ROW][COL + 1] == 0) {
            for (let r = ROW, c = COL; c >= 0 && this.data[r][c] == this.player; c--) { //右无子
                max++;
            };
            this.everyWeight(ROW, COL, 0, -1, max);
            max = 0;
        };
        if (ROW != 14 && COL != 14 && this.data[ROW + 1][COL + 1] == 0) { //右下无子
            for (let r = ROW, c = COL; r >= 0 && c >= 0 && this.data[r][c] == this.player; r--, c--) {
                max++;
            };
            this.everyWeight(ROW, COL, -1, -1, max);
            max = 0;
        };
    },
    everyWeight: function(ROW, COL, rsign, csign, max) { //计算权重:rsign:行方向;csign:列方向
        var weight = this.player == 2 ? this.myWeight : this.rivalWeight;
        this.player = this.player == 1 ? 2 : 1; //查找对方棋子
        weight[ROW - rsign][COL - csign] += (max > 4) ? 1000 : //成五
            (max == 4 && this.data[ROW + rsign * 4][COL + csign * 4] == 0) ? 90 : //活四
            (max == 3 && this.data[ROW + rsign * 3][COL + csign * 3] == 0) ? 50 : //活三
            (max == 4 && this.data[ROW + rsign * 4][COL + csign * 4] == (undefined || this.player)) ? 60 : //死四
            (max == 3 && this.data[ROW + rsign * 3][COL + csign * 3] == (undefined || this.player)) ? 30 : //死三
            (max == 2 && this.data[ROW + rsign * 2][COL + csign * 2] == 0) ? 20 : //活二
            (max == 2 && this.data[ROW + rsign * 2][COL + csign * 2] == (undefined || this.player)) ? 10 : //死二
            1; //单子
        this.player = this.player == 1 ? 2 : 1;
        if (this.player == 2) { //白子权重+1
            weight[ROW - rsign][COL - csign] = weight[ROW - rsign][COL - csign] + 1;
        }
        this.player == 2 ? (this.myWeight = weight) : (this.rivalWeight = weight);
    },
    updataView: function() { //更新页面
        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                let chess = document.getElementById('r' + r + 'c' + c);
                if (this.data[r][c] == 1) {
                    chess.className = 'black';
                } else if (this.data[r][c] == 2) {
                    chess.className = 'white';
                }
            }
        };
        var gameOver = document.getElementById("gameOver");
        if (this.state == this.GAMEOVER) { //判断游戏是否失败
            var winner = this.player == 1 ? "黑棋先生" : "白棋先生";
            document.getElementById('winner').innerHTML = winner + "赢了！";
            gameOver.style.display = "block";
        } else {
            gameOver.style.display = "none";
        }
    },
    isGameOver: function() { //游戏结束算法
        var maxcountr = 0,
            maxcountc = 0,
            maxcountangle = 0,
            maxcountsubangle = 0;
        var countc = 0,
            countr = 0,
            countangle = 0,
            countsubangle = 0;
        for (let i = 0; i < 15; i++) {
            if (this.data[this.ROW][i] == this.player) {
                countc++;
                maxcountc = maxcountc > countc ? maxcountc : countc;
            } else {
                countc = 0;
            }
            if (this.data[i][this.COL] == this.player) {
                countr++;
                maxcountr = maxcountr > countr ? maxcountr : countr;
            } else {
                countr = 0;
            }
        };
        var angleRow = this.COL + this.ROW < 15 ? this.ROW + this.COL : 14;
        var angleCol = this.ROW + this.COL < 15 ? 0 : this.ROW + this.COL - 14;
        var subangleRow = this.COL < this.ROW ? this.ROW - this.COL : 0;
        var subangleCol = this.COL < this.ROW ? 0 : this.COL - this.ROW;
        for (let r = angleRow, c = angleCol; r >= 0 && c < 15; r--, c++) {
            if (this.data[r][c] == this.player) {
                countangle++;
                maxcountangle = maxcountangle > countangle ? maxcountangle : countangle;
            } else {
                countangle = 0;
            }
        }
        for (let r = subangleRow, c = subangleCol; r < 15 && c < 15; r++, c++) {
            if (this.data[r][c] == this.player) {
                countsubangle++;
                maxcountsubangle = maxcountsubangle > countsubangle ? maxcountsubangle : countsubangle;
            } else {
                countsubangle = 0;
            }
        };
        if (maxcountc > 4 || maxcountr > 4 || maxcountangle > 4 || maxcountsubangle > 4) {
            return false;
        }
        return true;
    },
}

window.onload = function() {
    game.start(1);
}
