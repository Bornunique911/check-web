shared_examples 'media actions' do
  it 'should create an item and assign it', bin4: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media')
    expect(@driver.page_source.include?('Assigments updated successfully')).to be(false)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__assign').click
    wait_for_selector('input[type=checkbox]').click
    wait_for_selector('.multi__selector-save').click
    wait_for_selector('.message')
    expect(@driver.page_source.include?('Assignments updated successfully')).to be(true)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__history').click
    wait_for_selector('.annotation__timestamp')
    expect(@driver.page_source.include?('Item assigned to')).to be(true)
  end

  it 'should refresh media', bin1: true do
    api_create_team_project_and_link_and_redirect_to_media_page({ url: 'https://ca.ios.ba/files/meedan/random.php' })
    wait_for_selector('.media-detail')
    title1 = wait_for_selector('.media-expanded__title span').text
    expect((title1 =~ /Random/).nil?).to be(false)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__refresh').click
    wait_for_text_change(title1, '.media-expanded__title span', :css)
    title2 = wait_for_selector('.media-expanded__title span').text
    expect((title2 =~ /Random/).nil?).to be(false)
    expect(title1 != title2).to be(true)
  end

  it 'should autorefresh media when annotation is created', bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    url = @driver.current_url
    wait_for_selector('.media-detail')
    expect(@driver.page_source.include?('Auto-Refresh')).to be(false)
    current_window = @driver.window_handles.last
    @driver.execute_script("window.open('#{url}')")
    @driver.switch_to.window(@driver.window_handles.last)
    wait_for_selector('.media-tab__comments').click
    fill_field('#cmd-input', 'Auto-Refresh')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotations__list-item')
    @driver.execute_script('window.close()')
    @driver.switch_to.window(current_window)
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.annotation__card-activity-comment')
    expect(@driver.page_source.include?('Auto-Refresh')).to be(true)
  end

  it 'should lock and unlock status', bin2: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__lock-status').click
    wait_for_selector_none('.media-actions__assign')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__history').click
    wait_for_selector('.annotation__timestamp')
    expect(@driver.page_source.include?('Item status locked by')).to be(true)
    wait_for_selector('#item-history__close-button').click
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__lock-status').click
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__history').click
    wait_for_selector("//span[contains(text(), 'Item status unlocked by')]", :xpath)
    expect(@driver.page_source.include?('Item status unlocked by')).to be(true)
  end

  it 'should add and delete note', bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.annotations__list')
    fill_field('#cmd-input', 'A comment')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.annotation--comment')
    expect(@driver.page_source.include?('A comment')).to be(true)
    @driver.navigate.refresh
    wait_for_selector('.media-detail')
    wait_for_selector("//span[contains(text(), 'Go to settings')]", :xpath)
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.annotation--comment')
    expect(@driver.page_source.include?('A comment')).to be(true)
    wait_for_selector('.annotation .menu-button').click
    wait_for_selector('.annotation__delete').click
    wait_for_selector_none('.annotation__avatar-col')
    expect(@driver.page_source.include?('A comment')).to be(false)
    @driver.navigate.refresh
    wait_for_selector('.media-detail')
    wait_for_selector("//span[contains(text(), 'Go to settings')]", :xpath)
    wait_for_selector('.media-tab__comments').click
    expect(@driver.page_source.include?('A comment')).to be(false)
  end

  it 'should add image to media comment', bin3: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    # First, verify that there isn't any comment with image
    expect(@driver.page_source.include?('This is my comment with image')).to be(false)
    wait_for_selector('.media-tab__comments').click
    old = @driver.find_elements(:class, 'annotations__list-item').length
    wait_for_selector('.media-tab__comments').click
    # Add a comment as a command
    fill_field('#cmd-input', 'This is my comment with image')
    wait_for_selector('.add-annotation__insert-photo').click
    wait_for_selector('input[type=file]').send_keys(File.join(File.dirname(__FILE__), 'files/test.png'))
    wait_for_selector('#add-annotation_submit').click
    wait_for_selector_none('.with-file')
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__history').click
    wait_for_size_change(old, 'annotations__list-item', :class)
    wait_for_selector('#item-history__close-button').click

    # Verify that comment was added to annotations list
    wait_for_selector('.media-tab__comments').click
    expect(@driver.page_source.include?('This is my comment with image')).to be(true)
    # verify link and text
    imgtext = @driver.find_element(:css, '.annotation__card-file').text
    expect(imgtext.match(/test\.png$/).nil?).to be(false)
    imgsrc = @driver.find_element(:css, '.annotation__card-file').attribute('href')
    expect(imgsrc.match(/test\.png$/).nil?).to be(false)

    # Reload the page and verify that comment is still there
    @driver.navigate.refresh
    wait_for_selector('.media__annotations-column')
    wait_for_selector('.media-tab__comments').click
    wait_for_selector('.annotation--card')
    expect(@driver.page_source.include?('This is my comment with image')).to be(true)
    imgtext = @driver.find_element(:css, '.annotation__card-file').text
    expect(imgtext.match(/test\.png$/).nil?).to be(false)
    imgsrc = @driver.find_element(:css, '.annotation__card-file').attribute('href')
    expect(imgsrc.match(/test\.png$/).nil?).to be(false)
  end

  it 'should not create duplicated media', bin1: true do
    api_create_team_project_and_link_and_redirect_to_media_page({ url: @media_url })
    id1 = @driver.current_url.to_s.gsub(%r{^.*/media/}, '').to_i
    expect(id1.positive?).to be(true)
    wait_for_selector('.media-detail')
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items"
    wait_for_selector('.search__results')
    wait_for_selector('.medias__item')
    wait_for_selector('#create-media__add-item').click
    fill_field('#create-media-input', @media_url)
    wait_for_selector('#create-media-dialog__submit-button').click
    wait_for_selector('.media-detail')
    id2 = @driver.current_url.to_s.gsub(%r{^.*/media/}, '').to_i
    expect(id1 == id2).to be(true)
  end

  it 'should move media to another project', bin1: true do
    claim = 'This is going to be moved'

    # Create a couple projects under the same team
    p1 = api_create_team_and_project({ use_default_project: true })
    p1url = "#{@config['self_url']}/#{p1[:team].slug}/project/#{p1[:project].dbid}"
    p2 = api_create_project(p1[:team].dbid.to_s)
    p2url = "#{@config['self_url']}/#{p2.team['slug']}/project/#{p2.dbid}"

    # Go to the first project make sure that there is no claim
    @driver.navigate.to p1url
    wait_for_selector('.search__results')
    expect(@driver.page_source.include?(claim)).to be(false)
    expect(@driver.page_source.include?('1 / 1')).to be(false)
    expect(@driver.page_source.include?('There are no items')).to be(true)

    # Go to the second project make sure that there is no claim
    @driver.navigate.to p2url
    wait_for_selector('.search__results')
    expect(@driver.page_source.include?(claim)).to be(false)
    expect(@driver.page_source.include?('1 / 1')).to be(false)
    expect(@driver.page_source.include?('There are no items')).to be(true)

    # Create a claim under project 2
    create_media(claim)
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?(claim)).to be(true)
    expect(@driver.page_source.include?('1 / 1')).to be(true)
    expect(@driver.page_source.include?('There are no items')).to be(false)
    wait_for_selector('.media__heading a') # wait for backend to process claim

    # Move the claim to another project
    @driver.execute_script('window.scrollTo(0, 0)')
    wait_for_selector("tbody input[type='checkbox']:not(:checked)").click
    wait_for_selector('#bulk-actions-menu__button').click
    wait_for_selector('.bulk-actions-menu__move').click
    wait_for_selector('.MuiRadio-root .MuiIconButton-label input').click
    wait_for_selector('.multi__selector-save').click
    @driver.navigate.to p1url
    expect(@driver.current_url.to_s == p1url).to be(true)
    wait_for_selector_list_size('.medias__item', 1)
    expect(@driver.page_source.include?('1 / 1')).to be(true)
    expect(@driver.page_source.include?('There are no items')).to be(false)

    # Go back to the second project and make sure that the claim is not there anymore
    @driver.navigate.to p2url
    wait_for_selector('.search__results')
    expect(@driver.page_source.include?('1 / 1')).to be(false)
    expect(@driver.page_source.include?('There are no items')).to be(true)

    # Reload the first project page and make sure that the claim is there
    @driver.navigate.to p1url
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?(claim)).to be(true)
    expect(@driver.page_source.include?('1 / 1')).to be(true)
    expect(@driver.page_source.include?('There are no items')).to be(false)
  end

  it 'should move media to another project from item page', bin2: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('#search-input')
    create_folder_or_collection('project 2', '.projects-list__add-folder')
    wait_for_selector('.project-list__link', index: 1)
    wait_for_selector('.project-list__link', index: 1).click
    wait_for_selector('.media__heading').click
    wait_for_selector('#media-actions-bar__move-to').click
    wait_for_selector('input[name=project-title]').click
    wait_for_selector('input[name=project-title]').send_keys('Project')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media-actions-bar__move-button').click
    wait_for_selector('#search-input')
    wait_for_selector('.media__heading')
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector('.project-list__link', index: 1)
    wait_for_selector('.project-list__link', index: 1).click
    wait_for_selector_none('.media__heading', :css, 10)
    expect(page_source_body.include?('My search result')).to be(false)
  end
end
