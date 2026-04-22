import courses from '../data/courses.json';

export default function Courses({ onBack }) {
  return (
    <div className="page courses">
      <div className="card">
        <h2>精选成长课程</h2>
        <p className="subtitle">根据你的测试结果，推荐以下课程</p>
        <div className="course-list">
          {courses.map((c) => (
            <div className="c-item" key={c.id}>
              <div className="course-header">
                <h3>{c.title}</h3>
                <span className="tag">{c.tag}</span>
              </div>
              <p>{c.desc}</p>
              <div className="course-footer">
                <span className="price">{c.price}</span>
                <button className="btn-small">了解详情</button>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-ghost full" onClick={onBack}>返回结果</button>
      </div>
    </div>
  );
}
