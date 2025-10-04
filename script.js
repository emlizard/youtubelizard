// ⭐️ 중요: 이 곳에 발급받은 본인의 YouTube API 키를 입력하세요.
const API_KEY = 'AIzaSyDbCcyjDOclg8UVOzorJ_rRkrjrwc59Kf4';

// HTML 요소 가져오기
const topicInput = document.getElementById('topic-input');
const categoryButtonsContainer = document.getElementById('category-buttons');
const videoResultsContainer = document.getElementById('video-results');
const sortOrderSelect = document.getElementById('sort-order');
const resultsCountInput = document.getElementById('results-count');
const addKeywordBtn = document.getElementById('add-keyword-btn');
const customKeywordInput = document.getElementById('custom-keyword-input');
const languageSelect = document.getElementById('language-select');
const statsContainer = document.getElementById('stats-container');

// 키워드 추가 버튼 이벤트
addKeywordBtn.addEventListener('click', () => {
    const newKeyword = customKeywordInput.value.trim();
    if (newKeyword) {
        const newButton = document.createElement('button');
        newButton.dataset.category = newKeyword;
        newButton.textContent = newKeyword;
        categoryButtonsContainer.appendChild(newButton);
        customKeywordInput.value = '';
    }
});

// 카테고리 버튼 컨테이너에 이벤트 위임
categoryButtonsContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const topic = topicInput.value.trim();
        const category = event.target.dataset.category;
        const videoType = document.querySelector('input[name="video-type"]:checked').value;

        if (topic === '') {
            alert('궁금한 신체 부위나 증상을 입력해주세요! (예: 허리)');
            topicInput.focus();
            return;
        }

        const searchQuery = `${topic} ${category} ${videoType}`.trim();
        searchVideos(searchQuery);
    }
});


// 유튜브 영상 검색 함수
async function searchVideos(query) {
    videoResultsContainer.innerHTML = '<p>영상을 검색 중입니다... 📺</p>';
    statsContainer.innerHTML = ''; // 통계 컨테이너 초기화

    const sortOrder = sortOrderSelect.value;
    const maxResults = resultsCountInput.value;
    const language = languageSelect.value;

    let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${API_KEY}&type=video&maxResults=${maxResults}&order=${sortOrder}&videoEmbeddable=true`;

    if (language) {
        searchUrl += `&relevanceLanguage=${language}`;
    }

    try {
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            videoResultsContainer.innerHTML = `<p>'${query}'에 대한 영상이 없습니다.</p>`;
            return;
        }

        displayVideos(searchData.items);
        
        const videoIds = searchData.items.map(item => item.id.videoId).join(',');
        
        // 통계를 가져오기 위한 추가 API 호출
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${API_KEY}`;
        
        const statsResponse = await fetch(statsUrl);
        const statsData = await statsResponse.json();
        
        displayStats(statsData.items);

    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        const errorMessage = error.toString().includes('API key') 
            ? 'API 키가 유효한지 확인해주세요.' 
            : '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        videoResultsContainer.innerHTML = `<p>영상을 불러오는 데 실패했습니다. ${errorMessage}</p>`;
    }
}

// 통계 정보를 화면에 표시하는 함수
function displayStats(videosWithStats) {
    if (!videosWithStats || videosWithStats.length === 0) {
        statsContainer.innerHTML = '<h2>📊 검색 결과 통계</h2><p>통계 정보를 불러올 수 없습니다.</p>';
        return;
    }

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;

    videosWithStats.forEach(video => {
        totalViews += parseInt(video.statistics.viewCount || 0);
        totalLikes += parseInt(video.statistics.likeCount || 0);
        totalComments += parseInt(video.statistics.commentCount || 0);
    });

    const videoCount = videosWithStats.length;
    const avgViews = videoCount > 0 ? Math.floor(totalViews / videoCount) : 0;
    const avgLikes = videoCount > 0 ? Math.floor(totalLikes / videoCount) : 0;

    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    statsContainer.innerHTML = `
        <h2>📊 검색 결과 통계</h2>
        <div class="stats-item">
            <strong>총 조회수</strong>
            <span>${formatNumber(totalViews)} 회</span>
        </div>
        <div class="stats-item">
            <strong>영상 평균 조회수</strong>
            <span>${formatNumber(avgViews)} 회</span>
        </div>
        <div class="stats-item">
            <strong>총 좋아요 수</strong>
            <span>${formatNumber(totalLikes)} 개</span>
        </div>
        <div class="stats-item">
            <strong>영상 평균 좋아요 수</strong>
            <span>${formatNumber(avgLikes)} 개</span>
        </div>
        <div class="stats-item">
            <strong>총 댓글 수</strong>
            <span>${formatNumber(totalComments)} 개</span>
        </div>
        <div class="stats-item">
            <strong>검색된 영상 수</strong>
            <span>${videoCount} 개</span>
        </div>
    `;
}

// 검색된 영상을 화면에 표시하는 함수
function displayVideos(videos) {
    videoResultsContainer.innerHTML = '';

    videos.forEach(video => {
        const videoElement = createVideoCard(video);
        videoResultsContainer.appendChild(videoElement);
    });
}

// 비디오 카드 HTML 요소를 생성하는 함수
function createVideoCard(video) {
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const thumbnailUrl = video.snippet.thumbnails.high.url;
    
    const a = document.createElement('a');
    a.href = `https://www.youtube.com/watch?v=${videoId}`;
    a.target = '_blank';
    a.className = 'video-card';
    
    a.innerHTML = `
        <img src="${thumbnailUrl}" alt="${title}">
        <div class="title">${title}</div>
    `;
    return a;
}
// script.js 의 맨 아래에 추가

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('서비스 워커가 등록되었습니다:', registration);
      })
      .catch((error) => {
        console.error('서비스 워커 등록에 실패했습니다:', error);
      });
  }
});