#!/bin/bash

# 不止一间自习室 - 部署脚本
# 用于快速部署前端小程序和后端服务

set -e

echo "🚀 开始部署不止一间自习室项目..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装后再运行此脚本"
        exit 1
    fi
}

# 检查必要的工具
check_dependencies() {
    log_info "检查依赖工具..."
    check_command "node"
    check_command "npm"
    check_command "mysql"
    
    # 检查Node.js版本
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ $NODE_VERSION -lt 16 ]; then
        log_error "Node.js版本过低，需要16.0.0或更高版本"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 部署后端服务
deploy_backend() {
    log_info "开始部署后端服务..."
    
    cd backend
    
    # 安装依赖
    log_info "安装后端依赖..."
    npm install --production
    
    # 检查环境配置
    if [ ! -f .env ]; then
        log_warning ".env文件不存在，复制模板文件..."
        cp .env.example .env
        log_warning "请编辑 backend/.env 文件配置相关参数"
    fi
    
    # 构建项目
    log_info "构建后端项目..."
    npm run build
    
    # 数据库初始化
    log_info "初始化数据库..."
    if ! mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS zishi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null; then
        log_warning "数据库创建失败，请手动创建数据库"
    fi
    
    cd ..
    log_success "后端服务部署完成"
}

# 部署前端小程序
deploy_frontend() {
    log_info "开始部署前端小程序..."
    
    # 安装依赖
    log_info "安装前端依赖..."
    npm install
    
    # 检查小程序配置
    if [ ! -f project.config.json ]; then
        log_error "project.config.json文件不存在"
        exit 1
    fi
    
    # 检查appid配置
    APPID=$(grep -o '"appid": "[^"]*"' project.config.json | cut -d'"' -f4)
    if [ "$APPID" = "wxe123456789abcdef" ]; then
        log_warning "请修改 project.config.json 中的 appid 为您的小程序ID"
    fi
    
    log_success "前端小程序部署完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 检查PM2是否安装
    if command -v pm2 &> /dev/null; then
        log_info "使用PM2启动后端服务..."
        cd backend
        pm2 start dist/app.js --name "zishi-backend"
        pm2 save
        cd ..
    else
        log_info "PM2未安装，使用npm启动后端服务..."
        cd backend
        npm start &
        cd ..
    fi
    
    log_success "服务启动完成"
}

# Docker部署
deploy_docker() {
    log_info "使用Docker部署..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    # 构建镜像
    log_info "构建Docker镜像..."
    docker build -t zishi-backend ./backend
    
    # 运行容器
    log_info "启动Docker容器..."
    docker run -d \
        --name zishi-backend \
        -p 3000:3000 \
        --restart unless-stopped \
        zishi-backend
    
    log_success "Docker部署完成"
}

# 显示使用帮助
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help      显示帮助信息"
    echo "  -b, --backend   仅部署后端服务"
    echo "  -f, --frontend  仅部署前端小程序"
    echo "  -d, --docker    使用Docker部署"
    echo "  -s, --start     启动服务"
    echo "  --full          完整部署（默认）"
    echo ""
    echo "示例:"
    echo "  $0                # 完整部署"
    echo "  $0 --backend      # 仅部署后端"
    echo "  $0 --docker       # Docker部署"
}

# 主函数
main() {
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -b|--backend)
            check_dependencies
            deploy_backend
            ;;
        -f|--frontend)
            check_dependencies
            deploy_frontend
            ;;
        -d|--docker)
            deploy_docker
            ;;
        -s|--start)
            start_services
            ;;
        --full|"")
            check_dependencies
            deploy_backend
            deploy_frontend
            start_services
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 脚本开始
echo "=========================================="
echo "    不止一间自习室 - 自动部署脚本"
echo "=========================================="
echo ""

# 执行主函数
main $1

echo ""
echo "=========================================="
log_success "部署完成！"
echo ""
echo "📱 前端小程序: 使用微信开发者工具导入项目"
echo "🔧 后端服务: http://localhost:3000"
echo "📊 健康检查: http://localhost:3000/health"
echo ""
echo "📝 注意事项:"
echo "1. 请确保已配置 backend/.env 文件"
echo "2. 请修改 project.config.json 中的 appid"
echo "3. 请配置微信小程序服务器域名"
echo "4. 生产环境请使用HTTPS和域名访问"
echo "=========================================="