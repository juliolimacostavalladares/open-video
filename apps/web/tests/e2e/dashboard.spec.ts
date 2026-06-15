import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should display dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/Open Video Studio/);
  });

  test('should show projects list', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check if projects section exists
    const projectsSection = page.locator('text=Projetos');
    await expect(projectsSection).toBeVisible();
  });
});

test.describe('Project Creation', () => {
  test('should create a new project', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click "Novo Projeto" button
    await page.click('text=Novo Projeto');
    
    // Fill project form
    await page.fill('input[name="title"]', 'Test Project E2E');
    await page.fill('textarea[name="description"]', 'Test description');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to project page
    await page.waitForURL(/\/projects\/.+/);
    
    // Verify project was created
    await expect(page.locator('h1')).toContainText('Test Project E2E');
  });
});

test.describe('Editor', () => {
  test('should load editor with project data', async ({ page }) => {
    // Navigate to a project (assuming one exists)
    await page.goto('/dashboard');
    
    // Click on first project
    const firstProject = page.locator('a[href^="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      
      // Wait for editor to load
      await page.waitForSelector('[data-testid="editor-container"]', { timeout: 10000 });
      
      // Check if timeline is visible
      const timeline = page.locator('[data-testid="timeline"]');
      await expect(timeline).toBeVisible();
    }
  });
});
