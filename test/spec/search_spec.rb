shared_examples 'search' do
  it 'sort by date that the media was created', bin4: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector('#add-filter-menu__open-button').click
    wait_for_selector('#add-filter-menu__time-range').click
    wait_for_selector('.date-range__start-date input').click
    # Click OK on date picker dialog to select today's date
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector('.date-range__end-date input').click
    # Click OK on date picker dialog to select today's date
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector('#search-fields__submit-button').click
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it 'should filter by status and search by keywords', bin2: true, quick: true do
    api_create_team_project_claims_sources_and_redirect_to_project_page({ count: 2 })
    wait_for_selector('#search-input')
    wait_for_selector('.media__heading').click
    change_the_status_to('.media-status__menu-item--false', false)
    wait_for_selector('.project-header__back-button').click
    wait_for_selector('#search-input')
    wait_for_selector('#add-filter-menu__open-button').click
    wait_for_selector('#add-filter-menu__status').click
    wait_for_selector('.custom-select-dropdown__select-button').click
    wait_for_selector('input#verified').click
    wait_for_selector('input#false').click
    wait_for_selector('.multi__selector-save').click
    wait_for_selector('#search-fields__submit-button').click
    expect(page_source_body.include?('Claim 0')).to be(false)
    wait_for_selector('.multi-select-filter')
    expect(@driver.page_source.include?('Claim 1')).to be(true)
    expect(@driver.page_source.include?('Claim 0')).to be(false)
    selected = @driver.find_elements(:css, '.multi-select-filter__tag-remove')
    expect(selected.size == 2).to be(true)
    # reset filter
    wait_for_selector('#search-fields__clear-button').click
    wait_for_selector_list_size('.media__heading', 2)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
    # search by keyword
    wait_for_selector('#search-input').send_keys(:control, 'a', :delete)
    wait_for_selector('#search-input').send_keys('Claim 0')
    @driver.action.send_keys(:enter).perform
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.page_source.include?('Claim 0')).to be(true)
  end

  it 'should filter item by status on trash page', bin5: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('#search-input')
    wait_for_selector('.media__heading').click
    wait_for_selector('.media')
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector('.media-actions__icon').click
    wait_for_selector('.media-actions__send-to-trash').click
    wait_for_selector('.message').click
    wait_for_selector('.project-header__back-button').click
    expect(@driver.find_elements(:css, '.medias__item').empty?)
    wait_for_selector('.project-list__item-trash').click # Go to the trash page
    wait_for_selector('.media__heading')
    # use filter option
    wait_for_selector('#add-filter-menu__open-button').click
    wait_for_selector('#add-filter-menu__status').click
    wait_for_selector('.custom-select-dropdown__select-button').click
    wait_for_selector('input#in_progress').click
    wait_for_selector('.multi__selector-save').click
    wait_for_selector('#search-fields__submit-button').click
    wait_for_selector('.multi-select-filter')
    expect(page_source_body.include?('My search result')).to be(false)
    # reset filter
    @driver.navigate.refresh
    wait_for_selector('#search-input')
    wait_for_selector('#search-fields__clear-button').click
    wait_for_selector('.media__heading')
    expect(page_source_body.include?('My search result')).to be(true)
  end

  it 'should search and change sort criteria', bin5: true do
    api_create_claim_and_go_to_search_page
    expect(@driver.current_url.to_s.match(/requests/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/related/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/recent_added/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/last_seen/).nil?).to be(true)

    wait_for_selector('#search-input')
    wait_for_selector('th[data-field=linked_items_count] span').click
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.current_url.to_s.match(/requests/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/related/).nil?).to be(false)
    expect(@driver.current_url.to_s.match(/recent_added/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/last_seen/).nil?).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(true)

    wait_for_selector('th[data-field=created_at_timestamp] span').click
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.current_url.to_s.match(/requests/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/related/).nil?).to be(true)
    expect(@driver.current_url.to_s.match(/recent_added/).nil?).to be(false)
    expect(@driver.current_url.to_s.match(/last_seen/).nil?).to be(true)
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it 'should search by status through URL', bin1: true do
    api_create_claim_and_go_to_search_page
    expect((@driver.title =~ /False/).nil?).to be(true)
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B\u0022verification_status\u0022%3A%5B\u0022false\u0022%5D%7D"
    wait_for_selector('#search-fields__clear-button')
    expect((@driver.title =~ /False/).nil?).to be(false)
    expect(@driver.page_source.include?('My search result')).to be(false)
    wait_for_selector('#search-fields__clear-button')
    selected = @driver.find_elements(:css, '.multi-select-filter__tag')
    expect(selected.size == 1).to be(true)
  end

  it 'should search by date range', bin4: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)

    # Pre-populate dates to force the date picker to open at certain calendar months.
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B%20%22range%22%3A%20%7B%22created_at%22%3A%7B%22start_time%22%3A%222016-01-01%22%2C%22end_time%22%3A%222016-02-28%22%7D%7D%7D"
    wait_for_selector_none('.medias__item', :css, 10)
    expect(@driver.page_source.include?('My search result')).to be(false)

    wait_for_selector('.date-range__start-date input').click
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector_none('body>div[role=dialog]')  # wait for mui-picker background to fade away
    wait_for_selector('.date-range__end-date input').click
    wait_for_selector("//span[contains(text(), 'OK')]", :xpath).click
    wait_for_selector_none('body>div[role=dialog]')  # wait for mui-picker background to fade away
    wait_for_selector('#search-fields__submit-button').click
    wait_for_selector_none('.medias__item', :css, 10)
    expect(@driver.page_source.include?('My search result')).to be(false)
  end

  it 'should search by relative date range', bin4: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.medias__item')
    expect(@driver.page_source.include?('My search result')).to be(true)

    # Pre-populate with items created in the last 3 days, so will show our just-made item
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B%20%22range%22%3A%20%7B%22created_at%22%3A%7B%22condition%22%3A%22less_than%22%2C%22period%22%3A3%2C%22period_type%22%3A%22d%22%7D%7D%7D"
    wait_for_selector('.medias__item', :css, 10)
    expect(@driver.page_source.include?('My search result')).to be(true)
    wait_for_selector('input[value="3"]').click
    # Switch to six days, hit submit button, make sure that works too
    wait_for_selector('input[value="3"]').send_keys(:control, 'a', :delete, '6')
    wait_for_selector('#search-fields__submit-button').click
    wait_for_selector('.medias__item', :css, 10)
    expect(@driver.page_source.include?('My search result')).to be(true)
  end
  it 'should change search sort and search criteria through URL', bin3: true do
    api_create_claim_and_go_to_search_page
    wait_for_selector('.media__heading', :css, 20, true)
    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B\u0022sort\u0022%3A\u0022related\u0022%2C\u0022sort_type\u0022%3A\u0022DESC\u0022%7D"
    wait_for_selector('#search-input')
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.page_source.include?('My search result')).to be(true)
    expect(@driver.find_elements(:css, 'th[data-field=linked_items_count]> span > svg').length).to eq 1
    expect(@driver.find_elements(:css, 'th[data-field=created_at_timestamp]> span > svg').empty?).to be(true)

    @driver.navigate.to "#{@config['self_url']}/#{get_team}/all-items/%7B\u0022sort\u0022%3A\u0022recent_added\u0022%2C\u0022sort_type\u0022%3A\u0022DESC\u0022%7D"
    wait_for_selector('#search-input')
    wait_for_selector('.media__heading', :css, 20, true)
    expect(@driver.page_source.include?('My search result')).to be(true)
    expect(@driver.find_elements(:css, 'th[data-field=linked_items_count]> span > svg').empty?).to be(true)
    expect(@driver.find_elements(:css, 'th[data-field=created_at_timestamp]> span > svg').length).to eq 1
  end

  it 'should search for reverse images', bin2: true do
    api_create_team_and_project
    @driver.navigate.to @config['self_url']
    wait_for_selector('.project__description')
    create_image('files/test.png')
    wait_for_selector('.medias__item')
    wait_for_selector('.media__heading').click
    wait_for_selector('.image-media-card')
    wait_for_selector("//span[contains(text(), 'Go to settings')]", :xpath)
    expect((@driver.current_url.to_s =~ /google/).nil?).to be(true)
    current_window = @driver.window_handles.last
    wait_for_selector('#media-expanded-actions__menu').click
    wait_for_selector('#media-expanded-actions__reverse-image-search').click
    @driver.switch_to.window(@driver.window_handles.last)
    expect((@driver.current_url.to_s =~ /google/).nil?).to be(false)
    @driver.switch_to.window(current_window)
  end

  it 'should find all medias with an empty search', bin1: true do
    api_create_team_project_and_claim_and_redirect_to_media_page
    wait_for_selector('.media-detail')
    wait_for_selector('.project-header__back-button').click
    create_image('files/test.png')
    old = wait_for_selector_list('.medias__item').length
    wait_for_selector('#search-input').click
    @driver.action.send_keys(:enter).perform
    current = wait_for_selector_list('.medias__item').length
    expect(old == current).to be(true)
    expect(current.positive?).to be(true)
  end
end
