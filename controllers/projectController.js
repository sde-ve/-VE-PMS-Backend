
const Project = require('../models/projectModel')

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.getAllProjects();

    return res.status(200).json({
      success: true,
      message: projects.length
        ? 'Projects fetched successfully'
        : 'No projects found',
      data: projects
    });
  } catch (err) {
    console.error('getProjects error:', err);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch projects',
      error: err.message
    });
  }
};

exports.createProject = async (req, res) => {
  console.log(res,'req.body');
  console.log(res,'ressss');
  
  
  
  const { name, projectKey } = req.body;
  const key = (projectKey || "").trim().toUpperCase();

  if (!name?.trim() || !/^[A-Z]{2,10}$/.test(key)) {
    return res.status(400).json({
      error: "Project name and a 2-10 letter project key are required",
    });
  }

  try {
    const project = await Project.createProject(
      name.trim(),
      key,
      req.userId
    );

    res.status(201).json(project);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Project key already exists" });
    }

    throw error;
  }
};

exports.getProjectById = async (req, res) => {
  const project = await Project.getProjectById(req.params.id);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  res.json(project);
};
