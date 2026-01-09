import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { authenticateToken, AuthenticatedRequest, validateInput } from '@/lib/middleware';
import { moderateContent } from '@/lib/ai';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  authenticateToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await dbConnect();
      const userId = req.user?.userId;

      const validation = validateInput(req, res, ['title', 'description', 'skill', 'skillCategory']);
      if (validation) return;

      // Sanitize and validate inputs
      let { title, description, skill, skillCategory, modules, price, thumbnail } = req.body;
      
      title = String(title || '').trim();
      description = String(description || '').trim();
      skill = String(skill || '').trim();
      skillCategory = String(skillCategory || '').trim();
      
      // Validate lengths
      if (title.length < 3 || title.length > 200) {
        return res.status(400).json({ error: 'Title must be between 3 and 200 characters' });
      }
      if (description.length < 10 || description.length > 2000) {
        return res.status(400).json({ error: 'Description must be between 10 and 2000 characters' });
      }
      if (skill.length < 2 || skill.length > 100) {
        return res.status(400).json({ error: 'Skill name must be between 2 and 100 characters' });
      }
      
      // Validate price
      const priceNum = parseInt(String(price || 0));
      if (isNaN(priceNum) || priceNum < 0 || priceNum > 10000) {
        return res.status(400).json({ error: 'Price must be between 0 and 10000 tokens' });
      }

      // Content moderation
      const moderationResult = await moderateContent(`${title} ${description}`);
      if (!moderationResult.safe) {
        return res.status(400).json({ error: 'Content does not meet safety guidelines' });
      }

      // Validate modules structure if provided
      let validatedModules: any[] = [];
      if (modules && Array.isArray(modules)) {
        validatedModules = modules.slice(0, 50).map((module: any) => ({
          title: String(module.title || '').trim().substring(0, 200),
          description: String(module.description || '').trim().substring(0, 1000),
          order: parseInt(module.order) || 0,
          lessons: Array.isArray(module.lessons) ? module.lessons.slice(0, 100).map((lesson: any) => ({
            title: String(lesson.title || '').trim().substring(0, 200),
            description: String(lesson.description || '').trim().substring(0, 500),
            order: parseInt(lesson.order) || 0,
            content: {
              type: ['video', 'text', 'pdf', 'link'].includes(lesson.content?.type) ? lesson.content.type : 'text',
              url: lesson.content?.url ? String(lesson.content.url).substring(0, 500) : undefined,
              text: lesson.content?.text ? String(lesson.content.text).trim().substring(0, 5000) : undefined,
              externalLink: lesson.content?.externalLink ? String(lesson.content.externalLink).substring(0, 500) : undefined,
            },
          })) : [],
        }));
      }

      const course = await Course.create({
        title,
        description,
        skill,
        skillCategory,
        creator: userId,
        modules: validatedModules,
        price: priceNum,
        thumbnail: thumbnail ? String(thumbnail).substring(0, 500) : undefined,
        status: 'draft',
      });

      res.status(201).json({
        message: 'Course created successfully',
        course,
      });
    } catch (error: any) {
      console.error('Course Creation Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
